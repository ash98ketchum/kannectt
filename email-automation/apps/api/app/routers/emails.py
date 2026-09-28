from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.models.schemas import SendRequest, SendResponse, SendResult
from app.services import email_sender, llm
from app.services.credit import deduct, get_balance
from app.core.config import settings
from app.db.client import get_client
from datetime import datetime, timezone

router = APIRouter()


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
    template: str = Form(...),
    targets_json: str = Form(...),
    user_id: str = Form(...),
    resume: UploadFile | None = File(None),
):
    """
    Personalise + send emails. Deducts 3 credits per successful send.
    """
    import json
    from app.models.schemas import EmailTarget

    targets = [EmailTarget(**t) for t in json.loads(targets_json)]
    resume_bytes = await resume.read() if resume else None
    resume_filename = resume.filename if resume else "resume.pdf"

    cost = settings.CREDIT_COST_SEND * len(targets)
    balance = await get_balance(user_id)
    if balance < cost:
        raise HTTPException(status_code=402, detail=f"Insufficient credits: need {cost}, have {balance}")

    results = []
    credits_used = 0

    for target in targets:
        company = target.company or email_sender.company_from_email(target.mail)
        try:
            subject, body = llm.personalise(template, company, target.type)
            ok = email_sender.send(target.mail, subject, body, resume_bytes, resume_filename)
            status = "sent" if ok else "failed"
            if ok:
                credits_used += settings.CREDIT_COST_SEND
        except Exception as exc:
            subject, body, status = "", "", "failed"

        results.append(SendResult(
            to=target.mail, company=company,
            subject=subject, body=body, status=status,
        ))

        # Log to DB
        db = get_client()
        db.table("email_sends").insert({
            "user_id": user_id,
            "to_email": target.mail,
            "company": company,
            "subject": subject,
            "status": status,
            "sent_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

    new_balance = await deduct(user_id, credits_used)
    return SendResponse(results=results, credits_used=credits_used, credits_remaining=new_balance)
