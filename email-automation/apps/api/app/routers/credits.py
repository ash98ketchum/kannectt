import razorpay
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    CreditBalance, CreateOrderRequest, CreateOrderResponse,
    CreditOrdersResponse, CreditOrder,
)
from app.services.credit import get_balance
from app.db.client import get_client
from app.core.config import settings

router = APIRouter()

PACKAGES = {
    "starter": 20,
    "pro":     60,
    "power":   150,
}

# Prices in paise (INR) — ₹20 / ₹50 / ₹100
PRICES = {
    "starter": 2000,    # ₹20  (2000 paise)
    "pro":     5000,    # ₹50  (5000 paise)
    "power":   10000,   # ₹100 (10000 paise)
}


def _razorpay_client() -> razorpay.Client:
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payments not configured")
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@router.get("/balance/{user_id}", response_model=CreditBalance)
async def balance(user_id: str):
    bal = await get_balance(user_id)
    return CreditBalance(balance=bal)


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(req: CreateOrderRequest, user_id: str):
    """
    Step 1 of Razorpay Standard Checkout.
    Creates a Razorpay order and a pending credit_orders row.
    Returns order_id, amount, and currency for the frontend modal.
    """
    if req.package not in PACKAGES:
        raise HTTPException(status_code=400, detail=f"Unknown package '{req.package}'")

    credits = PACKAGES[req.package]
    amount  = PRICES[req.package]   # in paise, minimum is 100

    client = _razorpay_client()
    try:
        order = client.order.create({
            "amount":   amount,
            "currency": "INR",
            "receipt":  f"kannectt_{req.package}_{user_id[:8]}",
            "notes": {
                "user_id": user_id,
                "package": req.package,
                "credits": str(credits),
            },
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay error: {e}")

    # Persist a pending order immediately so history is visible right away
    db = get_client()
    db.table("credit_orders").insert({
        "user_id":             user_id,
        "razorpay_order_id":   order["id"],
        "package":             req.package,
        "credits":             credits,
        "amount_inr_paise":    amount,
        "status":              "pending",
    }).execute()

    return CreateOrderResponse(
        order_id=order["id"],
        amount=amount,
        currency="INR",
    )


@router.get("/orders/{user_id}", response_model=CreditOrdersResponse)
async def order_history(user_id: str):
    """Return the user's credit purchase history, newest first."""
    db = get_client()
    rows = (
        db.table("credit_orders")
        .select("id, package, credits, amount_inr_paise, status, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
        .data
    )
    return CreditOrdersResponse(orders=[CreditOrder(**r) for r in rows])
