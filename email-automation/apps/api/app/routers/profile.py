from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import storage
from app.models.schemas import ResumeUploadResponse, ResumeMetadata
from app.db.client import get_client

router = APIRouter()

MAX_PDF_BYTES = 5 * 1024 * 1024  # 5 MB


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
