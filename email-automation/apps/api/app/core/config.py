from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    ENVIRONMENT: str = "development"
    # Stored as raw string; parsed to list by the validator below.
    # Accepts EITHER  ["url1","url2"]  OR  url1,url2
    ALLOWED_ORIGINS: str = '["http://localhost:3000"]'

    @property
    def allowed_origins_list(self) -> List[str]:
        v = self.ALLOWED_ORIGINS.strip()
        if v.startswith("["):
            return json.loads(v)
        return [o.strip() for o in v.split(",") if o.strip()]

    # Groq
    GROQ_API_KEY: str
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    # Gmail SMTP (legacy fallback — users now store their own credentials)
    SENDER_EMAIL: str = ""
    GMAIL_APP_PASSWORD: str = ""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Encryption (Fernet key for per-user SMTP password storage)
    CONTACT_ENCRYPTION_KEY: str = ""

    # Credits
    CREDIT_COST_SEND: int = 3
    CREDIT_COST_TEMPLATE_GEN: int = 4
    CREDIT_COST_UNLOCK: int = 3
    FREE_TIER_SENDS: int = 1


settings = Settings()
