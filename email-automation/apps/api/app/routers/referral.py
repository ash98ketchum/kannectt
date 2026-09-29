"""
Referral system.

GET  /api/referral/{user_id}          — get user's referral code + stats
POST /api/referral/claim               — new user claims a referral code at signup
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.client import get_client
from app.services.credit import top_up

router = APIRouter()
log    = logging.getLogger(__name__)

REFERRAL_BONUS = 50   # credits given to referrer per successful referral


# ── Schemas ───────────────────────────────────────────────────────────────────

class ReferralStats(BaseModel):
    referral_code:  str
    referral_url:   str
    total_referrals: int
    credits_earned:  int


class ClaimRequest(BaseModel):
    referee_id:    str   # newly signed-up user's UUID
    referral_code: str   # code from the signup URL param


class ClaimResponse(BaseModel):
    success:        bool
    referrer_email: str
    credits_given:  int


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/{user_id}", response_model=ReferralStats)
async def get_referral_stats(user_id: str, base_url: str = "https://kannectt.com"):
    db = get_client()
    user = (
        db.table("users")
        .select("referral_code")
        .eq("id", user_id)
        .single()
        .execute()
        .data
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    code = user["referral_code"] or ""

    events = (
        db.table("referral_events")
        .select("credits_given")
        .eq("referrer_id", user_id)
        .execute()
        .data
    )

    return ReferralStats(
        referral_code=code,
        referral_url=f"{base_url}/signup?ref={code}",
        total_referrals=len(events),
        credits_earned=sum(e["credits_given"] for e in events),
    )


@router.post("/claim", response_model=ClaimResponse)
async def claim_referral(req: ClaimRequest):
    """
    Called right after a new user verifies their email.
    Looks up the referral code, validates it, gives the referrer 50 credits,
    and records the event for idempotency.
    """
    if not req.referral_code or not req.referee_id:
        raise HTTPException(status_code=400, detail="Missing referee_id or referral_code")

    db = get_client()

    # ── Check referral code is valid ─────────────────────────────────────────
    referrer_row = (
        db.table("users")
        .select("id, email")
        .eq("referral_code", req.referral_code)
        .execute()
        .data
    )
    if not referrer_row:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    referrer = referrer_row[0]
    referrer_id = referrer["id"]

    # ── Prevent self-referral ─────────────────────────────────────────────────
    if referrer_id == req.referee_id:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")

    # ── Idempotency — one reward per referee ──────────────────────────────────
    existing = (
        db.table("referral_events")
        .select("id")
        .eq("referee_id", req.referee_id)
        .execute()
        .data
    )
    if existing:
        log.info(f"Referral already claimed for referee {req.referee_id}")
        return ClaimResponse(
            success=True,
            referrer_email=referrer["email"],
            credits_given=0,
        )

    # ── Top up referrer's credits ─────────────────────────────────────────────
    new_balance = await top_up(referrer_id, REFERRAL_BONUS)
    log.info(f"Referral bonus: +{REFERRAL_BONUS} credits to {referrer_id}. Balance: {new_balance}")

    # ── Record event ─────────────────────────────────────────────────────────
    db.table("referral_events").insert({
        "referrer_id":   referrer_id,
        "referee_id":    req.referee_id,
        "credits_given": REFERRAL_BONUS,
    }).execute()

    # ── Also link the referee's referred_by ──────────────────────────────────
    db.table("users").update({"referred_by": referrer_id}).eq("id", req.referee_id).execute()

    return ClaimResponse(
        success=True,
        referrer_email=referrer["email"],
        credits_given=REFERRAL_BONUS,
    )
