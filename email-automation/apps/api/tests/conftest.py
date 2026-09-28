"""
conftest.py — Set required environment variables BEFORE any app module is imported.
This lets pytest run without a real .env file.
"""
import os

# Minimum required env vars — all real secrets are mocked in tests
os.environ.setdefault("GROQ_API_KEY",          "test-groq-key")
os.environ.setdefault("SENDER_EMAIL",          "test@example.com")
os.environ.setdefault("GMAIL_APP_PASSWORD",    "test-password")
os.environ.setdefault("SUPABASE_URL",          "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY",  "test-service-key")
os.environ.setdefault("STRIPE_SECRET_KEY",     "sk_test_dummy")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_dummy")
os.environ.setdefault("CONTACT_ENCRYPTION_KEY","dGVzdGtleXRlc3RrZXl0ZXN0a2V5dGVzdGtleXQ=")
