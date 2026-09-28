import pytest
from unittest.mock import AsyncMock, patch
from app.services import credit


@pytest.mark.asyncio
async def test_deduct_insufficient_credits():
    with patch("app.services.credit.get_client") as mock_client:
        mock_client.return_value.table.return_value.select.return_value \
            .eq.return_value.single.return_value.execute.return_value \
            .data = {"credits_balance": 2}

        with pytest.raises(ValueError, match="Insufficient credits"):
            await credit.deduct("user-123", 3)


@pytest.mark.asyncio
async def test_deduct_success():
    with patch("app.services.credit.get_client") as mock_client:
        mock_db = mock_client.return_value
        mock_db.table.return_value.select.return_value \
            .eq.return_value.single.return_value.execute.return_value \
            .data = {"credits_balance": 10}
        mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = None

        new_balance = await credit.deduct("user-123", 3)
    assert new_balance == 7
