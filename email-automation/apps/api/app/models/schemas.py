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


class CreateOrderRequest(BaseModel):
    package: Literal["starter", "pro", "power"]


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int        # paise
    currency: str      # "INR"


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str
    package: Literal["starter", "pro", "power"]


class VerifyPaymentResponse(BaseModel):
    success: bool
    credits_added: int
    new_balance: int


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


# ── Resume Storage ────────────────────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    path: str
    filename: str
    signed_url: str


class ResumeMetadata(BaseModel):
    path: str
    filename: str
    signed_url: str


# ── Credit Orders ─────────────────────────────────────────────────────────────

class CreditOrder(BaseModel):
    id: str
    package: str
    credits: int
    amount_inr_paise: int
    status: Literal["pending", "completed", "failed"]
    created_at: datetime


class CreditOrdersResponse(BaseModel):
    orders: list[CreditOrder]


# ── User ──────────────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    email: str
    credits_balance: int
    resume_path: Optional[str] = None
    resume_filename: Optional[str] = None
    created_at: datetime
