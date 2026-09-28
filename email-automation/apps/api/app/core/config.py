from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # Groq
    GROQ_API_KEY: str
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    # Gmail SMTP
    SENDER_EMAIL: str
    GMAIL_APP_PASSWORD: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Credits
    CREDIT_COST_SEND: int = 3
    CREDIT_COST_TEMPLATE_GEN: int = 4
    CREDIT_COST_UNLOCK: int = 3
    FREE_TIER_SENDS: int = 1

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
