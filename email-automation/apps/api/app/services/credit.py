"""
Credit engine — check balance, deduct, top up.
"""
from app.db.client import get_client


async def get_balance(user_id: str) -> int:
    db = get_client()
    result = db.table("users").select("credits_balance").eq("id", user_id).single().execute()
    return result.data["credits_balance"]


async def deduct(user_id: str, amount: int) -> int:
    """Deduct credits. Raises ValueError if balance insufficient. Returns new balance."""
    db = get_client()
    result = db.table("users").select("credits_balance").eq("id", user_id).single().execute()
    current = result.data["credits_balance"]

    if current < amount:
        raise ValueError(f"Insufficient credits: have {current}, need {amount}")

    new_balance = current - amount
    db.table("users").update({"credits_balance": new_balance}).eq("id", user_id).execute()
    return new_balance


async def top_up(user_id: str, amount: int) -> int:
    """Add credits. Returns new balance."""
    db = get_client()
    result = db.table("users").select("credits_balance").eq("id", user_id).single().execute()
    new_balance = result.data["credits_balance"] + amount
    db.table("users").update({"credits_balance": new_balance}).eq("id", user_id).execute()
    return new_balance
