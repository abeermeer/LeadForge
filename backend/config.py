import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
GOOGLE_SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/leadforge")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
MAX_RESULTS_PER_QUERY = 60
SEARCH_RADIUS_METERS = 50000
OVERLAP_FACTOR = 0.7
