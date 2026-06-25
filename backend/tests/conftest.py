import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

db_session_mock = MagicMock()
db_session_mock.__aenter__.return_value = db_session_mock
db_session_mock.__aexit__.return_value = None

_async_session_patcher = patch("backend.database.async_session", return_value=db_session_mock)
_get_session_patcher = patch("backend.database.get_session", return_value=db_session_mock)
_init_db_patcher = patch("backend.database.init_db", return_value=None)

_async_session_patcher.start()
_get_session_patcher.start()
_init_db_patcher.start()

import pytest
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from backend.routers.search import router as search_router
from backend.routers.leads import router as leads_router
from backend.routers.export import router as export_router

@pytest.fixture
def app():
    app = FastAPI(title="LeadForge-Test")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(search_router, prefix="/api")
    app.include_router(leads_router, prefix="/api")
    app.include_router(export_router, prefix="/api")

    @app.get("/api/health")
    async def health():
        return {"status": "ok", "database": "disconnected"}

    return app

@pytest.fixture
def app_with_key():
    os.environ["API_KEY"] = "test-key-123"

    import importlib
    import backend.config
    importlib.reload(backend.config)

    from backend.auth import verify_api_key

    test_app = FastAPI(title="LeadForge-Test-Auth")

    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    test_app.include_router(search_router, prefix="/api", dependencies=[Depends(verify_api_key)])
    test_app.include_router(leads_router, prefix="/api", dependencies=[Depends(verify_api_key)])
    test_app.include_router(export_router, prefix="/api", dependencies=[Depends(verify_api_key)])

    @test_app.get("/api/health")
    async def health():
        return {"status": "ok", "database": "disconnected"}

    yield test_app

    del os.environ["API_KEY"]
    importlib.reload(backend.config)
