import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text
from .database import init_db, async_session
from .routers import search, leads, export

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="LeadForge", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(leads.router, prefix="/api", tags=["leads"])
app.include_router(export.router, prefix="/api", tags=["export"])

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
