from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime


# ── Email / Send ──────────────────────────────────────────────────────────────

class EmailTarget(BaseModel):
    mail: EmailStr
    company: Optional[str] = None
    type: Literal["recruiter", "careers"] = "recruiter"


class SendRequest(BaseModel):
    targets: list[EmailTarget]
    template: str
    dry_run: bool = False


class SendResult(BaseModel):
    to: str
    company: str
    subject: str
    body: str
    status: Literal["sent", "failed", "preview"]
    error: Optional[str] = None


class SendResponse(BaseModel):
    results: list[SendResult]
    credits_used: int
    credits_remaining: int


# ── Credits ───────────────────────────────────────────────────────────────────

class CreditBalance(BaseModel):
    balance: int


class CheckoutRequest(BaseModel):
    package: Literal["starter", "pro", "power"]
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str


# ── Directory ─────────────────────────────────────────────────────────────────

class ContactPublic(BaseModel):
    id: str
    name: str
    title: str
    company: str
    department: str
    location: str
    seniority: str
    masked_email: str
    unlock_cost: int
    is_unlocked: bool = False


class ContactUnlocked(ContactPublic):
    email: str


class UnlockRequest(BaseModel):
    contact_ids: list[str]


class UnlockResponse(BaseModel):
    unlocked: list[ContactUnlocked]
    credits_used: int
    credits_remaining: int


# ── User ──────────────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    email: str
    credits_balance: int
    created_at: datetime
