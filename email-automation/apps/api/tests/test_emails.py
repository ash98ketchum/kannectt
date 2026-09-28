import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
from app.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as client:
        r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_dry_run_returns_preview_not_sent():
    """Dry-run must return status=preview and never charge credits."""
    payload = {
        "targets": [{"mail": "recruiter@google.com", "company": "Google", "type": "recruiter"}],
        "template": "Hi {{RECRUITER_NAME}}, applying to {{ROLE_TITLE}} at {{COMPANY_NAME}}. {{COMPANY_HIGHLIGHT}}",
        "dry_run": True,
    }
    with patch("app.routers.emails.llm.personalise") as mock_llm:
        mock_llm.return_value = ("Application for FDE at Google", "Hi Hiring Team, ...")
        async with AsyncClient(app=app, base_url="http://test") as client:
            r = await client.post("/api/send/dry-run", json=payload)

    assert r.status_code == 200
    data = r.json()
    assert data["credits_used"] == 0
    assert data["credits_remaining"] == 0
    assert len(data["results"]) == 1
    assert data["results"][0]["status"] == "preview"
    assert data["results"][0]["company"] == "Google"


@pytest.mark.asyncio
async def test_dry_run_multiple_targets():
    """Dry-run with multiple targets returns one result per target."""
    payload = {
        "targets": [
            {"mail": "jobs@stripe.com",    "company": "Stripe",    "type": "careers"},
            {"mail": "r@anthropic.com",    "company": "Anthropic", "type": "recruiter"},
        ],
        "template": "Hi {{RECRUITER_NAME}}, ...",
        "dry_run": True,
    }
    with patch("app.routers.emails.llm.personalise") as mock_llm:
        mock_llm.return_value = ("Subject", "Body")
        async with AsyncClient(app=app, base_url="http://test") as client:
            r = await client.post("/api/send/dry-run", json=payload)

    assert r.status_code == 200
    assert len(r.json()["results"]) == 2


@pytest.mark.asyncio
async def test_dry_run_llm_failure_returns_failed_status():
    """If LLM throws, the result status is 'failed' — not a 500."""
    payload = {
        "targets": [{"mail": "r@openai.com", "company": "OpenAI", "type": "recruiter"}],
        "template": "Hi {{RECRUITER_NAME}}",
        "dry_run": True,
    }
    with patch("app.routers.emails.llm.personalise", side_effect=Exception("Groq timeout")):
        async with AsyncClient(app=app, base_url="http://test") as client:
            r = await client.post("/api/send/dry-run", json=payload)

    assert r.status_code == 200
    result = r.json()["results"][0]
    assert result["status"] == "failed"
    assert "Groq timeout" in result["error"]


@pytest.mark.asyncio
async def test_execute_returns_402_when_credits_insufficient():
    """Execute endpoint must return 402 if user doesn't have enough credits."""
    with patch("app.routers.emails.get_balance", return_value=2):  # only 2 credits
        async with AsyncClient(app=app, base_url="http://test") as client:
            r = await client.post("/api/send/execute", data={
                "template": "Hi {{RECRUITER_NAME}}",
                "targets_json": '[{"mail":"r@google.com","company":"Google","type":"recruiter"}]',
                "user_id": "user-123",
            })
    assert r.status_code == 402
    assert "Insufficient credits" in r.json()["detail"]
