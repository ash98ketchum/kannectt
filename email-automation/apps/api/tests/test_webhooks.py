"""
Tests for the Razorpay webhook / payment-verify router.
"""
import hmac
import hashlib
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock, MagicMock
from app.main import app


def _asgi():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def _make_signature(order_id: str, payment_id: str, secret: str = "test_secret") -> str:
    msg = f"{order_id}|{payment_id}".encode()
    return hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()


# ── Signature verification ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_verify_bad_signature_returns_400():
    with patch("app.routers.payments.settings") as ms:
        ms.RAZORPAY_KEY_SECRET = "test_secret"
        with patch("app.routers.payments.get_client", return_value=MagicMock()):
            async with _asgi() as client:
                r = await client.post("/api/payments/verify", json={
                    "razorpay_order_id":   "order_123",
                    "razorpay_payment_id": "pay_456",
                    "razorpay_signature":  "bad_signature",
                    "user_id":             "user-abc",
                    "package":             "pro",
                })
    assert r.status_code == 400
    assert "signature mismatch" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_verify_missing_secret_returns_503():
    with patch("app.routers.payments.settings") as ms:
        ms.RAZORPAY_KEY_SECRET = ""
        async with _asgi() as client:
            r = await client.post("/api/payments/verify", json={
                "razorpay_order_id":   "order_123",
                "razorpay_payment_id": "pay_456",
                "razorpay_signature":  "sig",
                "user_id":             "user-abc",
                "package":             "pro",
            })
    assert r.status_code == 503
    assert "not configured" in r.json()["detail"].lower()


# ── Successful verification ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_verify_valid_signature_tops_up_credits():
    order_id   = "order_test_123"
    payment_id = "pay_test_456"
    secret     = "test_secret"
    sig        = _make_signature(order_id, payment_id, secret)

    mock_db   = MagicMock()
    order_row = MagicMock()
    order_row.data = [{"status": "pending", "credits": 60}]
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value = order_row
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock()

    with patch("app.routers.payments.settings") as ms:
        ms.RAZORPAY_KEY_SECRET = secret
        with patch("app.routers.payments.top_up", new_callable=AsyncMock, return_value=67) as mock_top_up:
            with patch("app.routers.payments.get_client", return_value=mock_db):
                async with _asgi() as client:
                    r = await client.post("/api/payments/verify", json={
                        "razorpay_order_id":   order_id,
                        "razorpay_payment_id": payment_id,
                        "razorpay_signature":  sig,
                        "user_id":             "user-abc",
                        "package":             "pro",
                    })

    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["credits_added"] == 60
    assert body["new_balance"]   == 67
    mock_top_up.assert_called_once_with("user-abc", 60)

    # Verify order was marked completed with payment_id
    update_call = mock_db.table.return_value.update
    call_kwargs = update_call.call_args[0][0]
    assert call_kwargs["status"]               == "completed"
    assert call_kwargs["razorpay_payment_id"]  == payment_id


@pytest.mark.asyncio
async def test_duplicate_verify_skips_top_up():
    """If order already completed, top_up must NOT be called again."""
    order_id   = "order_dupe"
    payment_id = "pay_dupe"
    secret     = "test_secret"
    sig        = _make_signature(order_id, payment_id, secret)

    mock_db   = MagicMock()
    order_row = MagicMock()
    order_row.data = [{"status": "completed", "credits": 60}]
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value = order_row

    with patch("app.routers.payments.settings") as ms:
        ms.RAZORPAY_KEY_SECRET = secret
        with patch("app.routers.payments.top_up", new_callable=AsyncMock, return_value=67) as mock_top_up:
            with patch("app.routers.payments.get_client", return_value=mock_db):
                async with _asgi() as client:
                    r = await client.post("/api/payments/verify", json={
                        "razorpay_order_id":   order_id,
                        "razorpay_payment_id": payment_id,
                        "razorpay_signature":  sig,
                        "user_id":             "user-abc",
                        "package":             "pro",
                    })

    assert r.status_code == 200
    mock_top_up.assert_called_once_with("user-abc", 0)   # 0-delta call just fetches balance


@pytest.mark.asyncio
async def test_verify_missing_fields_returns_400():
    with patch("app.routers.payments.settings") as ms:
        ms.RAZORPAY_KEY_SECRET = "test_secret"
        async with _asgi() as client:
            r = await client.post("/api/payments/verify", json={
                "razorpay_order_id":   "",
                "razorpay_payment_id": "",
                "razorpay_signature":  "",
                "user_id":             "user-abc",
                "package":             "pro",
            })
    assert r.status_code == 400
    assert "missing" in r.json()["detail"].lower()
