from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.routers import emails, credits, directory, webhooks, profile, payments, referral


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="ReachOut API",
    description="AI-powered email automation backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler — always sends CORS headers so browser
#    never sees a CORS error instead of the real error ──────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin and origin in settings.allowed_origins_list:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {exc}"},
        headers=headers,
    )


app.include_router(emails.router,    prefix="/api/send",      tags=["Send"])
app.include_router(credits.router,   prefix="/api/credits",   tags=["Credits"])
app.include_router(directory.router, prefix="/api/directory", tags=["Directory"])
app.include_router(webhooks.router,  prefix="/api/webhooks",  tags=["Webhooks"])
app.include_router(profile.router,   prefix="/api/profile",   tags=["Profile"])
app.include_router(payments.router,  prefix="/api/payments",  tags=["Payments"])
app.include_router(referral.router,  prefix="/api/referral",  tags=["Referral"])


@app.get("/health")
def health():
    return {"status": "ok"}
