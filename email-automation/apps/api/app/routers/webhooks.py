"""
Razorpay webhook handler.
Razorpay sends a POST to /api/webhooks/razorpay with an X-Razorpay-Signature header.
We verify with HMAC-SHA256 and handle payment.captured events.
"""
import hashlib
import hmac
import logging

from fastapi import APIRouter, Request, HTTPException, Header
from app.core.config import settings
from app.services.credit import top_up
from app.db.client import get_client

router = APIRouter()
log    = logging.getLogger(__name__)


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
):
    payload = await request.body()

    # ── Signature verification ────────────────────────────────────────────────
    secret = settings.RAZORPAY_KEY_SECRET
    if secret:
        expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, x_razorpay_signature or ""):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    import json
    event = json.loads(payload)
    event_type = event.get("event", "")

    if event_type == "payment.captured":
        payment     = event["payload"]["payment"]["entity"]
        order_id    = payment.get("order_id")
        payment_id  = payment.get("id")
        notes       = payment.get("notes", {})
        user_id     = notes.get("user_id")
        credits     = int(notes.get("credits", 0))

        if not (user_id and credits and order_id):
            log.warning(f"Webhook missing required fields: {notes}")
            return {"received": True}

        db = get_client()

        # ── Idempotency: skip if already completed ───────────────────────────
        existing = (
            db.table("credit_orders")
              .select("status")
              .eq("razorpay_order_id", order_id)
              .execute()
              .data
        )
        if existing and existing[0]["status"] == "completed":
            log.info(f"Duplicate webhook ignored for order {order_id}")
            return {"received": True}

        # ── Top up credits ───────────────────────────────────────────────────
        new_balance = await top_up(user_id, credits)
        log.info(f"Webhook: topped up {credits} credits for {user_id}. Balance: {new_balance}")

        # ── Mark order completed ─────────────────────────────────────────────
        db.table("credit_orders").update({
            "status":             "completed",
            "razorpay_payment_id": payment_id,
        }).eq("razorpay_order_id", order_id).execute()

    return {"received": True}
