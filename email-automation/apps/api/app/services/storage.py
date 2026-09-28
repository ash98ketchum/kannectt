"""
Supabase Storage service — upload / download resumes.

Storage layout:
  bucket: "resumes"
  key:    resumes/<user_id>/resume.pdf   (always overwritten — one active resume per user)
"""
import logging
from app.db.client import get_client

log = logging.getLogger(__name__)

BUCKET = "resumes"


def upload_resume(user_id: str, file_bytes: bytes, filename: str) -> str:
    """
    Upload a resume PDF to Supabase Storage.
    Returns the storage path (key) — use get_signed_url() to generate a download link.
    """
    db    = get_client()
    path  = f"resumes/{user_id}/{filename}"

    # upsert=True overwrites any existing file at the same path
    db.storage.from_(BUCKET).upload(
        path=path,
        file=file_bytes,
        file_options={
            "content-type": "application/pdf",
            "upsert": "true",
        },
    )

    # Persist path + filename to users table for later retrieval
    db.table("users").update({
        "resume_path":     path,
        "resume_filename": filename,
    }).eq("id", user_id).execute()

    log.info(f"Resume uploaded for user {user_id}: {path}")
    return path


def get_signed_url(path: str, expires_in: int = 3600) -> str:
    """Generate a short-lived signed URL for downloading a stored resume."""
    db  = get_client()
    res = db.storage.from_(BUCKET).create_signed_url(path, expires_in)
    return res["signedURL"]


def download_resume(path: str) -> bytes:
    """Download resume bytes directly (used by the email sender)."""
    db = get_client()
    return db.storage.from_(BUCKET).download(path)


def get_user_resume(user_id: str) -> dict | None:
    """Return the stored resume metadata for a user, or None if not uploaded."""
    db  = get_client()
    res = db.table("users").select("resume_path, resume_filename").eq("id", user_id).single().execute()
    if not res.data or not res.data.get("resume_path"):
        return None
    return {
        "path":     res.data["resume_path"],
        "filename": res.data["resume_filename"],
    }
