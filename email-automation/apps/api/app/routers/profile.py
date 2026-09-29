from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, EmailStr
from app.services import storage
from app.models.schemas import ResumeUploadResponse, ResumeMetadata
from app.db.client import get_client
from cryptography.fernet import Fernet
from app.core.config import settings

router = APIRouter()

MAX_PDF_BYTES = 5 * 1024 * 1024  # 5 MB


# ── Gmail settings schemas ────────────────────────────────────────────────────

class GmailSettingsRequest(BaseModel):
    sender_email: EmailStr
    gmail_app_password: str     # raw — encrypted before storing


class GmailSettingsResponse(BaseModel):
    sender_email: str
    is_configured: bool


def _fernet() -> Fernet:
    return Fernet(settings.CONTACT_ENCRYPTION_KEY.encode()
                  if isinstance(settings.CONTACT_ENCRYPTION_KEY, str)
                  else settings.CONTACT_ENCRYPTION_KEY)


# ── Gmail settings endpoints ──────────────────────────────────────────────────

@router.post("/gmail", response_model=GmailSettingsResponse)
async def save_gmail_settings(req: GmailSettingsRequest, user_id: str):
    """Save user's Gmail sender email + encrypted App Password."""
    f   = _fernet()
    enc = f.encrypt(req.gmail_app_password.encode()).decode()
    db  = get_client()
    db.table("users").update({
        "sender_email":           str(req.sender_email),
        "gmail_app_password_enc": enc,
    }).eq("id", user_id).execute()
    return GmailSettingsResponse(sender_email=str(req.sender_email), is_configured=True)


@router.get("/gmail", response_model=GmailSettingsResponse)
async def get_gmail_settings(user_id: str):
    """Return whether the user has configured their Gmail (never return the password)."""
    db  = get_client()
    row = db.table("users").select("sender_email, gmail_app_password_enc").eq("id", user_id).single().execute().data
    return GmailSettingsResponse(
        sender_email=row.get("sender_email") or "",
        is_configured=bool(row.get("sender_email") and row.get("gmail_app_password_enc")),
    )


def get_user_gmail_credentials(user_id: str) -> tuple[str, str]:
    """
    Returns (sender_email, gmail_app_password) for the given user.
    Raises HTTPException 400 if not configured.
    """
    db  = get_client()
    row = db.table("users").select("sender_email, gmail_app_password_enc").eq("id", user_id).single().execute().data
    if not row or not row.get("sender_email") or not row.get("gmail_app_password_enc"):
        raise HTTPException(
            status_code=400,
            detail="Gmail not configured. Go to Profile → Gmail Settings to set up your sender email.",
        )
    f        = _fernet()
    password = f.decrypt(row["gmail_app_password_enc"].encode()).decode()
    return row["sender_email"], password


@router.post("/resume", response_model=ResumeUploadResponse)
async def upload_resume(user_id: str, resume: UploadFile = File(...)):
    """
    Upload (or replace) the user's resume PDF to Supabase Storage.
    Returns a signed URL valid for 1 hour.
    """
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted")

    file_bytes = await resume.read()
    if len(file_bytes) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="Resume must be under 5 MB")

    path       = storage.upload_resume(user_id, file_bytes, resume.filename or "resume.pdf")
    signed_url = storage.get_signed_url(path)

    return ResumeUploadResponse(
        path=path,
        filename=resume.filename or "resume.pdf",
        signed_url=signed_url,
    )


@router.get("/resume", response_model=ResumeMetadata)
async def get_resume(user_id: str):
    """
    Return the stored resume metadata + a fresh signed URL.
    404 if the user hasn't uploaded a resume yet.
    """
    meta = storage.get_user_resume(user_id)
    if not meta:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")

    signed_url = storage.get_signed_url(meta["path"])
    return ResumeMetadata(
        path=meta["path"],
        filename=meta["filename"],
        signed_url=signed_url,
    )


@router.delete("/resume", status_code=204)
async def delete_resume(user_id: str):
    """Remove the stored resume from Storage and clear the user's resume_path."""
    from app.db.client import get_client
    meta = storage.get_user_resume(user_id)
    if not meta:
        raise HTTPException(status_code=404, detail="No resume to delete")

    db = get_client()
    db.storage.from_("resumes").remove([meta["path"]])
    db.table("users").update({"resume_path": None, "resume_filename": None}).eq("id", user_id).execute()
