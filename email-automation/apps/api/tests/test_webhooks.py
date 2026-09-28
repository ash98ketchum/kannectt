import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app


# ── Stripe signature verification ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_webhook_bad_signature_returns_400():
    """Invalid Stripe signature → 400."""
    import stripe
    with patch.object(stripe.Webhook, "construct_event",
                      side_effect=stripe.error.SignatureVerificationError("bad sig", "sig")):
        with patch("app.routers.webhooks.settings") as mock_settings:
            mock_settings.STRIPE_WEBHOOK_SECRET = "whsec_test"
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                r = await client.post(
                    "/api/webhooks/stripe",
                    content=b'{"type":"checkout.session.completed"}',
                    headers={"stripe-signature": "bad_sig"},
                )
    assert r.status_code == 400
    assert "Invalid signature" in r.json()["detail"]


@pytest.mark.asyncio
async def test_webhook_missing_secret_returns_503():
    """Missing webhook secret → 503."""
    with patch("app.routers.webhooks.settings") as mock_settings:
        mock_settings.STRIPE_WEBHOOK_SECRET = ""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r = await client.post(
                "/api/webhooks/stripe",
                content=b"{}",
                headers={"stripe-signature": "t=1,v1=abc"},
            )
    assert r.status_code == 503
    assert "not configured" in r.json()["detail"].lower()


# ── Successful checkout.session.completed ────────────────────────────────────

@pytest.mark.asyncio
async def test_webhook_checkout_completed_tops_up_credits():
    """Successful payment event → credits topped up for correct user."""
    event_payload = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "metadata": {
                    "user_id": "user-abc",
                    "package": "pro",
                    "credits": "60",
                }
            }
        },
    }
    import stripe
    with patch.object(stripe.Webhook, "construct_event", return_value=event_payload):
        with patch("app.routers.webhooks.settings") as mock_settings:
            mock_settings.STRIPE_WEBHOOK_SECRET = "whsec_test"
            with patch("app.routers.webhooks.top_up", new_callable=AsyncMock) as mock_top_up:
                mock_top_up.return_value = 67
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    r = await client.post(
                        "/api/webhooks/stripe",
                        content=b"{}",
                        headers={"stripe-signature": "t=1,v1=dummy"},
                    )

    assert r.status_code == 200
    assert r.json() == {"received": True}
    mock_top_up.assert_called_once_with("user-abc", 60)


@pytest.mark.asyncio
async def test_webhook_ignores_unknown_event_type():
    """Non-checkout events are ignored and return 200."""
    event_payload = {"type": "payment_intent.created", "data": {"object": {}}}
    import stripe
    with patch.object(stripe.Webhook, "construct_event", return_value=event_payload):
        with patch("app.routers.webhooks.settings") as mock_settings:
            mock_settings.STRIPE_WEBHOOK_SECRET = "whsec_test"
            with patch("app.routers.webhooks.top_up", new_callable=AsyncMock) as mock_top_up:
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    r = await client.post(
                        "/api/webhooks/stripe",
                        content=b"{}",
                        headers={"stripe-signature": "t=1,v1=dummy"},
                    )
    assert r.status_code == 200
    mock_top_up.assert_not_called()


# ── Metadata edge cases ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_webhook_missing_user_id_skips_top_up():
    """No user_id in metadata → top_up not called."""
    event_payload = {
        "type": "checkout.session.completed",
        "data": {"object": {"metadata": {"credits": "20"}}},  # no user_id
    }
    import stripe
    with patch.object(stripe.Webhook, "construct_event", return_value=event_payload):
        with patch("app.routers.webhooks.settings") as mock_settings:
            mock_settings.STRIPE_WEBHOOK_SECRET = "whsec_test"
            with patch("app.routers.webhooks.top_up", new_callable=AsyncMock) as mock_top_up:
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    r = await client.post(
                        "/api/webhooks/stripe",
                        content=b"{}",
                        headers={"stripe-signature": "t=1,v1=dummy"},
                    )
    assert r.status_code == 200
    mock_top_up.assert_not_called()
