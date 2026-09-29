"""
Razorpay payment verification — Step 3 of Standard Checkout.

POST /api/payments/verify
  Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, package }
  Returns: { success: true, credits_added, new_balance }

Algorithm (per Razorpay docs):
  expected = HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
  valid     = expected == razorpay_signature
"""
import hmac
import hashlib
import logging

from fastapi import APIRouter, HTTPException
from app.models.schemas import VerifyPaymentRequest, VerifyPaymentResponse
from app.services.credit import top_up
from app.db.client import get_client
from app.core.config import settings

router = APIRouter()
log    = logging.getLogger(__name__)

PACKAGES_CREDITS = {
    "starter": 20,
    "pro":     60,
    "power":   150,
}


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(req: VerifyPaymentRequest):
    """
    Verifies Razorpay payment signature, tops up credits, and marks the order complete.
    Called by the frontend after a successful Razorpay checkout modal.
    """
    # ── 1. Validate required fields ──────────────────────────────────────────
    if not all([req.razorpay_order_id, req.razorpay_payment_id, req.razorpay_signature]):
        raise HTTPException(status_code=400, detail="Missing payment fields")

    if not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payments not configured")

    # ── 2. Verify HMAC-SHA256 signature ──────────────────────────────────────
    message  = f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode()
    secret   = settings.RAZORPAY_KEY_SECRET.encode()
    expected = hmac.new(secret, message, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, req.razorpay_signature):
        log.warning(f"Signature mismatch for order {req.razorpay_order_id}")
        raise HTTPException(status_code=400, detail="Payment signature mismatch")

    # ── 3. Idempotency — skip if already completed ───────────────────────────
    db = get_client()
    existing = (
        db.table("credit_orders")
        .select("status, credits")
        .eq("razorpay_order_id", req.razorpay_order_id)
        .execute()
        .data
    )

    if existing and existing[0]["status"] == "completed":
        log.info(f"Duplicate verify ignored for order {req.razorpay_order_id}")
        new_balance = await top_up(req.user_id, 0)   # fetch without changing
        return VerifyPaymentResponse(
            success=True,
            credits_added=0,
            new_balance=new_balance,
        )

    # ── 4. Determine credits from order row or package fallback ──────────────
    credits = (
        existing[0]["credits"]
        if existing
        else PACKAGES_CREDITS.get(req.package, 0)
    )

    if credits <= 0:
        raise HTTPException(status_code=400, detail="Could not determine credits for this order")

    # ── 5. Top up credits ────────────────────────────────────────────────────
    new_balance = await top_up(req.user_id, credits)
    log.info(f"Topped up {credits} credits for user {req.user_id}. New balance: {new_balance}")

    # ── 6. Mark order completed ──────────────────────────────────────────────
    db.table("credit_orders").update({
        "status":               "completed",
        "razorpay_payment_id":  req.razorpay_payment_id,
    }).eq("razorpay_order_id", req.razorpay_order_id).execute()

    return VerifyPaymentResponse(
        success=True,
        credits_added=credits,
        new_balance=new_balance,
    )
