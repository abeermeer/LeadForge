import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
GOOGLE_SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")
_db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/leadforge")
DATABASE_URL = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1) if _db_url.startswith("postgresql://") and not _db_url.startswith("postgresql+asyncpg://") else _db_url
MAX_RESULTS_PER_QUERY = 60
SEARCH_RADIUS_METERS = 50000
OVERLAP_FACTOR = 0.7
