from fastapi import APIRouter, HTTPException
from app.models.schemas import CreditBalance, CheckoutRequest, CheckoutResponse
from app.services.credit import get_balance
from app.core.config import settings
import stripe

router = APIRouter()

PACKAGES = {
    "starter": 20,
    "pro":     60,
    "power":   150,
}

PRICES = {
    "starter": 200,   # cents
    "pro":     500,
    "power":   1000,
}


@router.get("/balance/{user_id}", response_model=CreditBalance)
async def balance(user_id: str):
    bal = await get_balance(user_id)
    return CreditBalance(balance=bal)


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(req: CheckoutRequest, user_id: str):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payments not configured")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": f"ReachOut {req.package.capitalize()} — {PACKAGES[req.package]} credits"},
                "unit_amount": PRICES[req.package],
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=req.success_url,
        cancel_url=req.cancel_url,
        metadata={"user_id": user_id, "package": req.package, "credits": PACKAGES[req.package]},
    )
    return CheckoutResponse(checkout_url=session.url)
