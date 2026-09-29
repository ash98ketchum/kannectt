#!/usr/bin/env python3
"""
scripts/seed_contacts.py
────────────────────────
Seeds the Supabase `contacts` table with a realistic set of recruiter /
hiring-team contacts so the directory page has something to show in local dev.

All email addresses are fake. They are AES-256 (Fernet) encrypted before being
written to the database — matching the production flow.

Usage:
    # From email-automation/ root:
    PYTHONPATH=apps/api python3 scripts/seed_contacts.py

    # Or via Makefile:
    make seed

Requires apps/api/.env with:
    SUPABASE_URL, SUPABASE_SERVICE_KEY, CONTACT_ENCRYPTION_KEY
"""

import os
import sys
import hashlib
from pathlib import Path
from dotenv import load_dotenv

# ── Load env from apps/api/.env ──────────────────────────────────────────────
env_path = Path(__file__).parent.parent / "apps" / "api" / ".env"
load_dotenv(env_path)

# ── Bootstrap app imports ─────────────────────────────────────────────────────
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))

from cryptography.fernet import Fernet
from app.db.client import get_client

# ── Encryption ────────────────────────────────────────────────────────────────
_key = os.environ.get("CONTACT_ENCRYPTION_KEY", "")
if not _key:
    print("✗  CONTACT_ENCRYPTION_KEY not set in apps/api/.env")
    sys.exit(1)

fernet = Fernet(_key.encode())

def encrypt(email: str) -> str:
    return fernet.encrypt(email.encode()).decode()

def sha256(email: str) -> str:
    return hashlib.sha256(email.encode()).hexdigest()


# ── Sample contacts ───────────────────────────────────────────────────────────
CONTACTS = [
    # (first, last, title, company, domain, dept, seniority, location, linkedin, email)
    ("Sarah",   "Miller",   "Engineering Recruiter",        "Google",    "google.com",     "Engineering", "Senior",  "San Francisco, CA", "https://linkedin.com/in/sarahmiller",    "s.miller@google.com"),
    ("James",   "Kim",      "Technical Recruiter",          "Stripe",    "stripe.com",     "Engineering", "Mid",     "New York, NY",      "https://linkedin.com/in/jameskim",       "j.kim@stripe.com"),
    ("Priya",   "Nair",     "Talent Acquisition Lead",      "OpenAI",    "openai.com",     "AI Research", "Lead",    "San Francisco, CA", "https://linkedin.com/in/priyanair",      "p.nair@openai.com"),
    ("Marcus",  "Turner",   "University Recruiter",         "Meta",      "meta.com",       "University",  "Mid",     "Menlo Park, CA",    "https://linkedin.com/in/marcusturner",   "m.turner@meta.com"),
    ("Anika",   "Rao",      "Senior Recruiter",             "Anthropic", "anthropic.com",  "Engineering", "Senior",  "San Francisco, CA", "https://linkedin.com/in/anikaro",        "a.rao@anthropic.com"),
    ("David",   "Lee",      "Recruiting Manager",           "Notion",    "notion.so",      "Engineering", "Manager", "Remote",            "https://linkedin.com/in/davidlee",       "d.lee@notion.so"),
    ("Sofia",   "Chen",     "Head of Talent",               "Figma",     "figma.com",      "Product",     "Director","San Francisco, CA", "https://linkedin.com/in/sofiachen",      "s.chen@figma.com"),
    ("Rahul",   "Gupta",    "Technical Sourcer",            "Databricks","databricks.com", "Engineering", "Mid",     "San Francisco, CA", "https://linkedin.com/in/rahulgupta",     "r.gupta@databricks.com"),
    ("Emma",    "Johnson",  "Recruiting Lead",              "Vercel",    "vercel.com",     "Engineering", "Lead",    "Remote",            "https://linkedin.com/in/emmajohnson",    "e.johnson@vercel.com"),
    ("Carlos",  "Rivera",   "Campus Recruiter",             "LinkedIn",  "linkedin.com",   "University",  "Mid",     "Sunnyvale, CA",     "https://linkedin.com/in/carlosrivera",   "c.rivera@linkedin.com"),
    ("Nina",    "Patel",    "Senior Technical Recruiter",   "Apple",     "apple.com",      "Engineering", "Senior",  "Cupertino, CA",     "https://linkedin.com/in/ninapatel",      "n.patel@apple.com"),
    ("Liam",    "Brooks",   "Talent Partner",               "Shopify",   "shopify.com",    "Product",     "Senior",  "Remote",            "https://linkedin.com/in/liambrooks",     "l.brooks@shopify.com"),
    ("Yuna",    "Park",     "Recruiter, ML & AI",           "Cohere",    "cohere.com",     "AI Research", "Mid",     "Toronto, Canada",   "https://linkedin.com/in/yunapark",       "y.park@cohere.com"),
    ("Tyler",   "Martin",   "Director of Recruiting",       "Rippling",  "rippling.com",   "Engineering", "Director","San Francisco, CA", "https://linkedin.com/in/tylermartin",    "t.martin@rippling.com"),
    ("Isabel",  "Costa",    "Talent Acquisition Manager",   "Brex",      "brex.com",       "Engineering", "Manager", "San Francisco, CA", "https://linkedin.com/in/isabelcosta",    "i.costa@brex.com"),
    ("Arjun",   "Sharma",   "Technical Recruiter",          "Scale AI",  "scale.com",      "Engineering", "Mid",     "San Francisco, CA", "https://linkedin.com/in/arjunsharma",    "a.sharma@scale.com"),
    ("Claire",  "Wong",     "University Relations Lead",    "Palantir",  "palantir.com",   "University",  "Lead",    "New York, NY",      "https://linkedin.com/in/clairewong",     "c.wong@palantir.com"),
    ("Omar",    "Hassan",   "Staff Recruiter",              "Plaid",     "plaid.com",      "Engineering", "Senior",  "San Francisco, CA", "https://linkedin.com/in/omarhassan",     "o.hassan@plaid.com"),
    ("Grace",   "Liu",      "Recruiter, Product",           "Linear",    "linear.app",     "Product",     "Mid",     "Remote",            "https://linkedin.com/in/graceliu",       "g.liu@linear.app"),
    ("Ethan",   "Morgan",   "Talent Sourcer",               "Retool",    "retool.com",     "Engineering", "Mid",     "San Francisco, CA", "https://linkedin.com/in/ethanmorgan",    "e.morgan@retool.com"),
]


def seed():
    db = get_client()

    # Check existing count
    existing = db.table("contacts").select("id", count="exact").execute()
    existing_count = existing.count or 0

    if existing_count > 0:
        print(f"ℹ  {existing_count} contacts already in the database.")
        answer = input("   Clear and re-seed? [y/N] ")
        if answer.lower() == "y":
            db.table("contacts").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print("   Cleared existing contacts.")
        else:
            print("   Seeding skipped.")
            return

    rows = []
    for first, last, title, company, domain, dept, seniority, location, linkedin, email in CONTACTS:
        rows.append({
            "first_name":      first,
            "last_name":       last,
            "title":           title,
            "company_name":    company,
            "company_domain":  domain,
            "department":      dept,
            "seniority":       seniority,
            "location":        location,
            "linkedin_url":    linkedin,
            "email_encrypted": encrypt(email),
            "email_hash":      sha256(email),
            "source":          "seed",
        })

    db.table("contacts").insert(rows).execute()
    print(f"✓  Seeded {len(rows)} contacts into the directory.")


if __name__ == "__main__":
    seed()
