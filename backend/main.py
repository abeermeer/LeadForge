from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db
from .routers import search, leads, export

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="LeadForge", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(leads.router, prefix="/api", tags=["leads"])
app.include_router(export.router, prefix="/api", tags=["export"])

@app.get("/api/health")
async def health():
    return {"status": "ok"}
