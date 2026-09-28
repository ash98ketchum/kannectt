"""
Tests for the Stripe webhook router — idempotency, signature, top-up.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock, MagicMock
from app.main import app


def _asgi():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


# ── Signature verification ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_webhook_bad_signature_returns_400():
    import stripe
    with patch.object(stripe.Webhook, "construct_event",
                      side_effect=stripe.error.SignatureVerificationError("bad", "sig")):
        with patch("app.routers.webhooks.settings") as ms:
            ms.STRIPE_WEBHOOK_SECRET = "whsec_test"
            async with _asgi() as client:
                r = await client.post("/api/webhooks/stripe", content=b"{}", headers={"stripe-signature": "bad"})
    assert r.status_code == 400
    assert "Invalid signature" in r.json()["detail"]


@pytest.mark.asyncio
async def test_webhook_missing_secret_returns_503():
    with patch("app.routers.webhooks.settings") as ms:
        ms.STRIPE_WEBHOOK_SECRET = ""
        async with _asgi() as client:
            r = await client.post("/api/webhooks/stripe", content=b"{}", headers={"stripe-signature": "t=1"})
    assert r.status_code == 503
    assert "not configured" in r.json()["detail"].lower()


# ── checkout.session.completed ────────────────────────────────────────────────

def _make_session(user_id="user-abc", credits="60", package="pro", session_id="cs_123", payment_id="pi_456"):
    return {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id":             session_id,
                "payment_intent": payment_id,
                "metadata": {"user_id": user_id, "package": package, "credits": credits},
            }
        },
    }


@pytest.mark.asyncio
async def test_checkout_completed_tops_up_and_completes_order():
    import stripe
    event = _make_session()

    mock_db   = MagicMock()
    order_row = MagicMock()
    order_row.data = [{"status": "pending"}]
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value = order_row
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

    with patch.object(stripe.Webhook, "construct_event", return_value=event):
        with patch("app.routers.webhooks.settings") as ms:
            ms.STRIPE_WEBHOOK_SECRET = "whsec_test"
            with patch("app.routers.webhooks.top_up", new_callable=AsyncMock, return_value=67) as mock_top_up:
                with patch("app.routers.webhooks.get_client", return_value=mock_db):
                    async with _asgi() as client:
                        r = await client.post("/api/webhooks/stripe", content=b"{}", headers={"stripe-signature": "t=1"})

    assert r.status_code == 200
    mock_top_up.assert_called_once_with("user-abc", 60)

    # Verify order was marked completed
    update_call = mock_db.table.return_value.update
    call_kwargs = update_call.call_args[0][0]
    assert call_kwargs["status"] == "completed"
    assert call_kwargs["stripe_payment_intent_id"] == "pi_456"


@pytest.mark.asyncio
async def test_duplicate_webhook_skips_top_up():
    """If order already completed, top_up must NOT be called again."""
    import stripe
    event = _make_session(session_id="cs_dupe")

    mock_db   = MagicMock()
    order_row = MagicMock()
    order_row.data = [{"status": "completed"}]  # already done
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value = order_row

    with patch.object(stripe.Webhook, "construct_event", return_value=event):
        with patch("app.routers.webhooks.settings") as ms:
            ms.STRIPE_WEBHOOK_SECRET = "whsec_test"
            with patch("app.routers.webhooks.top_up", new_callable=AsyncMock) as mock_top_up:
                with patch("app.routers.webhooks.get_client", return_value=mock_db):
                    async with _asgi() as client:
                        r = await client.post("/api/webhooks/stripe", content=b"{}", headers={"stripe-signature": "t=1"})

    assert r.status_code == 200
    mock_top_up.assert_not_called()


@pytest.mark.asyncio
async def test_webhook_missing_user_id_skips_top_up():
    import stripe
    event = {
        "type": "checkout.session.completed",
        "data": {"object": {"id": "cs_1", "payment_intent": None, "metadata": {"credits": "20"}}},
    }
    with patch.object(stripe.Webhook, "construct_event", return_value=event):
        with patch("app.routers.webhooks.settings") as ms:
            ms.STRIPE_WEBHOOK_SECRET = "whsec_test"
            with patch("app.routers.webhooks.top_up", new_callable=AsyncMock) as mock_top_up:
                async with _asgi() as client:
                    r = await client.post("/api/webhooks/stripe", content=b"{}", headers={"stripe-signature": "t=1"})
    assert r.status_code == 200
    mock_top_up.assert_not_called()


@pytest.mark.asyncio
async def test_webhook_ignores_unknown_event_type():
    import stripe
    event = {"type": "payment_intent.created", "data": {"object": {}}}
    with patch.object(stripe.Webhook, "construct_event", return_value=event):
        with patch("app.routers.webhooks.settings") as ms:
            ms.STRIPE_WEBHOOK_SECRET = "whsec_test"
            with patch("app.routers.webhooks.top_up", new_callable=AsyncMock) as mock_top_up:
                async with _asgi() as client:
                    r = await client.post("/api/webhooks/stripe", content=b"{}", headers={"stripe-signature": "t=1"})
    assert r.status_code == 200
    mock_top_up.assert_not_called()
