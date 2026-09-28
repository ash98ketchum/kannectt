from fastapi import APIRouter, Query
from app.models.schemas import ContactPublic, UnlockRequest, UnlockResponse
from app.services.credit import deduct, get_balance
from app.db.client import get_client
from app.core.config import settings
from cryptography.fernet import Fernet
import os

router = APIRouter()

# Encryption key for contact emails — store in env as CONTACT_ENCRYPTION_KEY
_fernet: Fernet | None = None

def get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = os.getenv("CONTACT_ENCRYPTION_KEY", Fernet.generate_key().decode())
        _fernet = Fernet(key.encode())
    return _fernet


def mask_email(email: str) -> str:
    parts = email.split("@")
    return parts[0][0] + "●" * 4 + "@" + parts[1]


@router.get("/", response_model=list[ContactPublic])
async def list_contacts(
    user_id: str,
    dept: str | None = Query(None),
    seniority: str | None = Query(None),
    company: str | None = Query(None),
):
    db = get_client()
    query = db.table("contacts").select("*")
    if dept:
        query = query.eq("department", dept)
    if seniority:
        query = query.eq("seniority", seniority)
    if company:
        query = query.ilike("company_name", f"%{company}%")

    contacts = query.execute().data

    # Fetch which contacts this user has already unlocked
    unlocked_ids = {
        row["contact_id"]
        for row in db.table("user_unlocks").select("contact_id").eq("user_id", user_id).execute().data
    }

    return [
        ContactPublic(
            id=c["id"],
            name=c["first_name"] + " " + c["last_name"][0] + ".",
            title=c["title"],
            company=c["company_name"],
            department=c["department"],
            location=c["location"],
            seniority=c["seniority"],
            masked_email=mask_email(get_fernet().decrypt(c["email_encrypted"].encode()).decode()),
            unlock_cost=settings.CREDIT_COST_UNLOCK,
            is_unlocked=c["id"] in unlocked_ids,
        )
        for c in contacts
    ]


@router.post("/unlock", response_model=UnlockResponse)
async def unlock_contacts(req: UnlockRequest, user_id: str):
    db = get_client()
    contacts_raw = db.table("contacts").select("*").in_("id", req.contact_ids).execute().data
    cost = settings.CREDIT_COST_UNLOCK * len(contacts_raw)

    new_balance = await deduct(user_id, cost)

    unlocked = []
    for c in contacts_raw:
        email = get_fernet().decrypt(c["email_encrypted"].encode()).decode()
        db.table("user_unlocks").upsert({
            "user_id": user_id,
            "contact_id": c["id"],
            "credits_spent": settings.CREDIT_COST_UNLOCK,
        }).execute()
        from app.models.schemas import ContactUnlocked
        unlocked.append(ContactUnlocked(
            id=c["id"],
            name=c["first_name"] + " " + c["last_name"][0] + ".",
            title=c["title"],
            company=c["company_name"],
            department=c["department"],
            location=c["location"],
            seniority=c["seniority"],
            masked_email=mask_email(email),
            unlock_cost=settings.CREDIT_COST_UNLOCK,
            is_unlocked=True,
            email=email,
        ))

    return UnlockResponse(unlocked=unlocked, credits_used=cost, credits_remaining=new_balance)
