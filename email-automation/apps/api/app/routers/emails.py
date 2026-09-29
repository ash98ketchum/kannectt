from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import SendRequest, SendResponse, SendResult
from app.services import email_sender, llm
from app.services.credit import deduct, get_balance
from app.core.config import settings
from app.db.client import get_client
from app.routers.profile import get_user_gmail_credentials
from datetime import datetime, timezone
import logging

router = APIRouter()
log = logging.getLogger(__name__)


@router.post("/dry-run", response_model=SendResponse)
async def dry_run(request: SendRequest):
    """
    Preview personalised emails without sending or charging credits.
    """
    results = []
    for target in request.targets:
        company = target.company or email_sender.company_from_email(target.mail)
        try:
            subject, body = llm.personalise(request.template, company, target.type)
            results.append(SendResult(
                to=target.mail, company=company,
                subject=subject, body=body, status="preview",
            ))
        except Exception as exc:
            results.append(SendResult(
                to=target.mail, company=company,
                subject="", body="", status="failed", error=str(exc),
            ))

    return SendResponse(results=results, credits_used=0, credits_remaining=0)


@router.post("/execute", response_model=SendResponse)
async def execute_send(
    template:      str                = Form(...),
    targets_json:  str                = Form(...),
    user_id:       str                = Form(...),
    resume:        UploadFile | None  = File(None),
    resume_url:    str | None         = Form(None),   # storage path for saved resume
):
    """
    Personalise + send emails. Deducts 3 credits per successful send.

    Resume priority:
      1. Uploaded file (resume form field)
      2. Stored resume path (resume_url form field → fetched from Supabase Storage)
      3. No resume attached
    """
    import json
    from app.models.schemas import EmailTarget

    targets = [EmailTarget(**t) for t in json.loads(targets_json)]

    # ── Resolve resume bytes ─────────────────────────────────────────────────
    resume_bytes:    bytes | None = None
    resume_filename: str         = "resume.pdf"

    if resume:
        resume_bytes    = await resume.read()
        resume_filename = resume.filename or "resume.pdf"
    elif resume_url:
        try:
            from app.services.storage import download_resume
            resume_bytes    = download_resume(resume_url)
            resume_filename = resume_url.split("/")[-1]
        except Exception as exc:
            log.warning(f"Could not fetch stored resume {resume_url}: {exc}")

    # ── Credit check ─────────────────────────────────────────────────────────
    cost    = settings.CREDIT_COST_SEND * len(targets)
    balance = await get_balance(user_id)
    if balance < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits: need {cost}, have {balance}",
        )

    # ── Fetch user's Gmail credentials ──────────────────────────────────────
    sender_email, gmail_password = get_user_gmail_credentials(user_id)

    results:      list[SendResult] = []
    credits_used: int              = 0
    db = get_client()

    for target in targets:
        company = target.company or email_sender.company_from_email(target.mail)
        subject = body = ""
        status  = "failed"
        try:
            subject, body = llm.personalise(template, company, target.type)
            ok     = email_sender.send(
                target.mail, subject, body,
                sender_email, gmail_password,
                resume_bytes, resume_filename,
            )
            status = "sent" if ok else "failed"
            if ok:
                credits_used += settings.CREDIT_COST_SEND
        except Exception as exc:
            log.error(f"Error processing {target.mail}: {exc}")

        results.append(SendResult(
            to=target.mail, company=company,
            subject=subject, body=body, status=status,
        ))

        db.table("email_sends").insert({
            "user_id":  user_id,
            "to_email": target.mail,
            "company":  company,
            "subject":  subject,
            "status":   status,
            "sent_at":  datetime.now(timezone.utc).isoformat(),
        }).execute()

    new_balance = await deduct(user_id, credits_used)
    return SendResponse(
        results=results,
        credits_used=credits_used,
        credits_remaining=new_balance,
    )
