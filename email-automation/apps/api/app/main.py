from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.routers import emails, credits, directory, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="ReachOut API",
    description="AI-powered email automation backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emails.router,    prefix="/api/send",      tags=["Send"])
app.include_router(credits.router,   prefix="/api/credits",   tags=["Credits"])
app.include_router(directory.router, prefix="/api/directory", tags=["Directory"])
app.include_router(webhooks.router,  prefix="/api/webhooks",  tags=["Webhooks"])


@app.get("/health")
def health():
    return {"status": "ok"}
