"""
Email sending service — refactored from the original send_emails.py script.
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path

from app.core.config import settings

log = logging.getLogger(__name__)


def build_message(
    to_email: str,
    subject: str,
    body: str,
    resume_bytes: bytes | None = None,
    resume_filename: str = "resume.pdf",
) -> MIMEMultipart:
    msg = MIMEMultipart()
    msg["From"]    = settings.SENDER_EMAIL
    msg["To"]      = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    if resume_bytes:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(resume_bytes)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{resume_filename}"')
        msg.attach(part)

    return msg


def send(
    to_email: str,
    subject: str,
    body: str,
    resume_bytes: bytes | None = None,
    resume_filename: str = "resume.pdf",
) -> bool:
    """Send email via Gmail SMTP. Returns True on success."""
    msg = build_message(to_email, subject, body, resume_bytes, resume_filename)
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.SENDER_EMAIL, settings.GMAIL_APP_PASSWORD)
            server.sendmail(settings.SENDER_EMAIL, to_email, msg.as_string())
        log.info(f"Email sent to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        log.error("Gmail authentication failed — check SENDER_EMAIL / GMAIL_APP_PASSWORD")
        return False
    except Exception as exc:
        log.error(f"Failed to send to {to_email}: {exc}")
        return False


def company_from_email(email: str) -> str:
    """Extract company name from a careers email domain."""
    domain = email.split("@")[-1]
    return domain.split(".")[0].capitalize()
