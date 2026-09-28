from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    CreditBalance, CheckoutRequest, CheckoutResponse,
    CreditOrdersResponse, CreditOrder,
)
from app.services.credit import get_balance
from app.db.client import get_client
from app.core.config import settings
import stripe

router = APIRouter()

PACKAGES = {
    "starter": 20,
    "pro":     60,
    "power":   150,
}

PRICES = {
    "starter": 200,   # cents  ($2)
    "pro":     500,   # cents  ($5)
    "power":   1000,  # cents  ($10)
}


@router.get("/balance/{user_id}", response_model=CreditBalance)
async def balance(user_id: str):
    bal = await get_balance(user_id)
    return CreditBalance(balance=bal)


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(req: CheckoutRequest, user_id: str):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payments not configured")

    credits = PACKAGES[req.package]
    price   = PRICES[req.package]

    stripe.api_key = settings.STRIPE_SECRET_KEY
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name":        f"kannectt {req.package.capitalize()} — {credits} credits",
                    "description": "Send personalised outreach emails and unlock recruiter contacts",
                },
                "unit_amount": price,
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=req.success_url,
        cancel_url=req.cancel_url,
        metadata={
            "user_id":  user_id,
            "package":  req.package,
            "credits":  credits,
        },
    )

    # Create a pending order so users can see their purchase history immediately
    db = get_client()
    db.table("credit_orders").insert({
        "user_id":           user_id,
        "stripe_session_id": session.id,
        "package":           req.package,
        "credits":           credits,
        "amount_usd_cents":  price,
        "status":            "pending",
    }).execute()

    return CheckoutResponse(checkout_url=session.url)


@router.get("/orders/{user_id}", response_model=CreditOrdersResponse)
async def order_history(user_id: str):
    """Return the user's credit purchase history, newest first."""
    db = get_client()
    rows = (
        db.table("credit_orders")
        .select("id, package, credits, amount_usd_cents, status, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
        .data
    )
    return CreditOrdersResponse(orders=[CreditOrder(**r) for r in rows])
