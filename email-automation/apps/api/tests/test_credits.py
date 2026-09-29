import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services import credit


# ── Credit service unit tests ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_balance_returns_correct_value():
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value \
        .single.return_value.execute.return_value.data = {"credits_balance": 42}

    with patch("app.services.credit.get_client", return_value=mock_db):
        result = await credit.get_balance("user-abc")

    assert result == 42


@pytest.mark.asyncio
async def test_deduct_success_returns_new_balance():
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value \
        .single.return_value.execute.return_value.data = {"credits_balance": 10}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = None

    with patch("app.services.credit.get_client", return_value=mock_db):
        new_balance = await credit.deduct("user-abc", 3)

    assert new_balance == 7


@pytest.mark.asyncio
async def test_deduct_raises_when_insufficient():
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value \
        .single.return_value.execute.return_value.data = {"credits_balance": 2}

    with patch("app.services.credit.get_client", return_value=mock_db):
        with pytest.raises(ValueError, match="Insufficient credits"):
            await credit.deduct("user-abc", 3)


@pytest.mark.asyncio
async def test_deduct_exact_balance_succeeds():
    """Deducting exactly your balance should work (zero result)."""
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value \
        .single.return_value.execute.return_value.data = {"credits_balance": 3}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = None

    with patch("app.services.credit.get_client", return_value=mock_db):
        new_balance = await credit.deduct("user-abc", 3)

    assert new_balance == 0


@pytest.mark.asyncio
async def test_top_up_increases_balance():
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value \
        .single.return_value.execute.return_value.data = {"credits_balance": 5}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = None

    with patch("app.services.credit.get_client", return_value=mock_db):
        new_balance = await credit.top_up("user-abc", 60)

    assert new_balance == 65


@pytest.mark.asyncio
async def test_top_up_from_zero():
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value \
        .single.return_value.execute.return_value.data = {"credits_balance": 0}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = None

    with patch("app.services.credit.get_client", return_value=mock_db):
        new_balance = await credit.top_up("user-abc", 20)

    assert new_balance == 20


# ── Razorpay create-order router tests ───────────────────────────────────────

@pytest.mark.asyncio
async def test_create_order_returns_order_id():
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    mock_rzp_order = {"id": "order_test_123", "amount": 500, "currency": "INR"}
    mock_db        = MagicMock()
    mock_db.table.return_value.insert.return_value.execute.return_value = MagicMock()

    with patch("app.routers.credits.settings") as ms:
        ms.RAZORPAY_KEY_ID     = "rzp_test_key"
        ms.RAZORPAY_KEY_SECRET = "test_secret"
        with patch("app.routers.credits.razorpay.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client.order.create.return_value = mock_rzp_order
            mock_client_cls.return_value = mock_client
            with patch("app.routers.credits.get_client", return_value=mock_db):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    r = await client.post(
                        "/api/credits/create-order?user_id=user-abc",
                        json={"package": "pro"},
                    )

    assert r.status_code == 200
    body = r.json()
    assert body["order_id"] == "order_test_123"
    assert body["amount"]   == 500
    assert body["currency"] == "INR"


@pytest.mark.asyncio
async def test_create_order_missing_keys_returns_503():
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    with patch("app.routers.credits.settings") as ms:
        ms.RAZORPAY_KEY_ID     = ""
        ms.RAZORPAY_KEY_SECRET = ""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r = await client.post(
                "/api/credits/create-order?user_id=user-abc",
                json={"package": "pro"},
            )

    assert r.status_code == 503
    assert "not configured" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_order_invalid_package_returns_400():
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    with patch("app.routers.credits.settings") as ms:
        ms.RAZORPAY_KEY_ID     = "rzp_test_key"
        ms.RAZORPAY_KEY_SECRET = "test_secret"
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r = await client.post(
                "/api/credits/create-order?user_id=user-abc",
                json={"package": "invalid"},
            )

    assert r.status_code == 422   # Pydantic validation rejects non-literal values
