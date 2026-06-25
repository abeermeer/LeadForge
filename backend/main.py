import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from .database import init_db, async_session
from .routers import search, leads, export
from .auth import verify_api_key

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="LeadForge", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api", tags=["search"], dependencies=[Depends(verify_api_key)])
app.include_router(leads.router, prefix="/api", tags=["leads"], dependencies=[Depends(verify_api_key)])
app.include_router(export.router, prefix="/api", tags=["export"], dependencies=[Depends(verify_api_key)])

@app.get("/api/health")
async def health():
    db_ok = False
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        logger.warning(f"Health check DB failure: {e}")
    return {"status": "ok" if db_ok else "degraded", "database": "connected" if db_ok else "disconnected"}
