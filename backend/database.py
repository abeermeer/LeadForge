import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from .config import DATABASE_URL
from .models.campaign import Base

logger = logging.getLogger(__name__)

engine = create_async_engine(DATABASE_URL, echo=False, connect_args={"timeout": 5})
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.warning(f"Database init failed (server will still start): {e}")

async def get_session():
    async with async_session() as session:
        yield session
