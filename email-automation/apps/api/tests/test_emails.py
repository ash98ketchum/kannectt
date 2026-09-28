import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as client:
        r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_dry_run_no_credits_charged():
    """Dry-run should return previews without touching credits."""
    payload = {
        "targets": [{"mail": "test@google.com", "company": "Google", "type": "recruiter"}],
        "template": "Hi {{RECRUITER_NAME}}, applying to {{ROLE_TITLE}} at {{COMPANY_NAME}}.",
        "dry_run": True,
    }
    async with AsyncClient(app=app, base_url="http://test") as client:
        r = await client.post("/api/send/dry-run", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["credits_used"] == 0
    assert len(data["results"]) == 1
    assert data["results"][0]["status"] == "preview"
