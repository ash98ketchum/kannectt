from fastapi import APIRouter, Request, HTTPException, Header
from app.services.credit import top_up
from app.core.config import settings
import stripe
import logging

router = APIRouter()
log = logging.getLogger(__name__)

PACKAGE_CREDITS = {"starter": 20, "pro": 60, "power": 150}


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
        session = event["data"]["object"]
        meta    = session.get("metadata", {})
        user_id = meta.get("user_id")
        credits = int(meta.get("credits", 0))

        if user_id and credits:
            await top_up(user_id, credits)
            log.info(f"Topped up {credits} credits for user {user_id}")

    return {"received": True}
