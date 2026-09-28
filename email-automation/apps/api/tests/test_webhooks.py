import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
from app.main import app
import json


@pytest.mark.asyncio
async def test_webhook_invalid_signature_returns_400():
    """Stripe webhook must reject requests with bad signatures."""
    with patch("app.routers.webhooks.settings") as mock_settings:
        mock_settings.STRIPE_WEBHOOK_SECRET = "whsec_test"

        import stripe
        with patch.object(stripe.Webhook, "construct_event",
                          side_effect=stripe.error.SignatureVerificationError("bad sig", "sig")):
            async with AsyncClient(app=app, base_url="http://test") as client:
                r = await client.post(
                    "/api/webhooks/stripe",
                    content=b"{}",
                    headers={"stripe-signature": "bad"},
                )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_webhook_completed_session_tops_up_credits():
    """checkout.session.completed event should add credits to user balance."""
    event_payload = {
        "type": "checkout.session.completed",
        "data": {"object": {
            "metadata": {"user_id": "user-123", "credits": "60", "package": "pro"}
        }}
    }

    with patch("app.routers.webhooks.settings") as mock_settings:
        mock_settings.STRIPE_WEBHOOK_SECRET = "whsec_test"

        import stripe
        with patch.object(stripe.Webhook, "construct_event", return_value=event_payload):
            with patch("app.routers.webhooks.top_up") as mock_top_up:
                mock_top_up.return_value = 65
                async with AsyncClient(app=app, base_url="http://test") as client:
                    r = await client.post(
                        "/api/webhooks/stripe",
                        content=json.dumps(event_payload).encode(),
                        headers={"stripe-signature": "valid"},
                    )

    assert r.status_code == 200
    mock_top_up.assert_called_once_with("user-123", 60)


@pytest.mark.asyncio
async def test_webhook_not_configured_returns_503():
    """Webhooks endpoint must 503 if STRIPE_WEBHOOK_SECRET is empty."""
    with patch("app.routers.webhooks.settings") as mock_settings:
        mock_settings.STRIPE_WEBHOOK_SECRET = ""
        async with AsyncClient(app=app, base_url="http://test") as client:
            r = await client.post("/api/webhooks/stripe", content=b"{}")
    assert r.status_code == 503


@pytest.mark.asyncio
async def test_email_sender_company_from_email():
    from app.services.email_sender import company_from_email
    assert company_from_email("careers@stripe.com")    == "Stripe"
    assert company_from_email("jobs@openai.com")       == "Openai"
    assert company_from_email("hr@anthropic.com")      == "Anthropic"
