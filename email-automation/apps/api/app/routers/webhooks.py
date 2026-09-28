from fastapi import APIRouter, Request, HTTPException, Header
from app.services.credit import top_up
from app.db.client import get_client
from app.core.config import settings
import stripe
import logging

router = APIRouter()
log = logging.getLogger(__name__)


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhooks not configured")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session    = event["data"]["object"]
        session_id = session.get("id")
        meta       = session.get("metadata", {})
        user_id    = meta.get("user_id")
        credits    = int(meta.get("credits", 0))
        payment_id = session.get("payment_intent")

        if not (user_id and credits):
            log.warning(f"Webhook missing user_id or credits: {meta}")
            return {"received": True}

        db = get_client()

        # ── Idempotency: skip if this session was already completed ──────────
        existing = (
            db.table("credit_orders")
            .select("status")
            .eq("stripe_session_id", session_id)
            .execute()
            .data
        )
        if existing and existing[0]["status"] == "completed":
            log.info(f"Duplicate webhook ignored for session {session_id}")
            return {"received": True}

        # ── Top up credits ───────────────────────────────────────────────────
        new_balance = await top_up(user_id, credits)
        log.info(f"Topped up {credits} credits for user {user_id}. New balance: {new_balance}")

        # ── Mark order completed ─────────────────────────────────────────────
        db.table("credit_orders").update({
            "status":                      "completed",
            "stripe_payment_intent_id":    payment_id,
        }).eq("stripe_session_id", session_id).execute()

    return {"received": True}
