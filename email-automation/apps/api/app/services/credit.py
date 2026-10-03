"""
Credit engine — check balance, deduct, top up.
All DB calls are wrapped in try/except so an unhandled exception
never bypasses CORSMiddleware (which would strip CORS headers).
"""
from fastapi import HTTPException
from app.db.client import get_client


def _get_row(db, user_id: str) -> dict:
    """Fetch user row; auto-create with 300 credits if missing."""
    result = db.table("users").select("credits_balance").eq("id", user_id).execute()
    rows = result.data or []
    if not rows:
        # User exists in auth.users but not yet in public.users — create them
        # Fetch email from auth.users via admin API
        try:
            auth_user = db.auth.admin.get_user_by_id(user_id)
            email = auth_user.user.email if auth_user and auth_user.user else f"{user_id}@unknown"
        except Exception:
            email = f"{user_id}@unknown"
        db.table("users").insert({
            "id": user_id,
            "email": email,
            "credits_balance": 300,
        }).execute()
        return {"credits_balance": 300}
    return rows[0]


async def get_balance(user_id: str) -> int:
    try:
        db = get_client()
        return _get_row(db, user_id)["credits_balance"]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Balance lookup failed: {exc}") from exc


async def deduct(user_id: str, amount: int) -> int:
    """Deduct credits. Raises 402 if balance insufficient. Returns new balance."""
    try:
        db      = get_client()
        current = _get_row(db, user_id)["credits_balance"]

        if current < amount:
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient credits: have {current}, need {amount}",
            )

        new_balance = current - amount
        db.table("users").update({"credits_balance": new_balance}).eq("id", user_id).execute()
        return new_balance
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Deduct failed: {exc}") from exc


async def top_up(user_id: str, amount: int) -> int:
    """Add credits. Returns new balance."""
    try:
        db          = get_client()
        current     = _get_row(db, user_id)["credits_balance"]
        new_balance = current + amount
        db.table("users").update({"credits_balance": new_balance}).eq("id", user_id).execute()
        return new_balance
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Top-up failed: {exc}") from exc
