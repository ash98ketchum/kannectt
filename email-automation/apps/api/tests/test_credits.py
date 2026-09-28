import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.services import credit


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
