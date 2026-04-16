from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from models.db_models import Base
from dotenv import load_dotenv

load_dotenv()

# For Supabase/PostgreSQL on Render, use DATABASE_URL.
# For local development, fallback to SQLite.
# Note: Supabase URLs from the dashboard starting with postgres:// should be changed to postgresql+asyncpg://
RAW_DB_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./maintenance.db")

if RAW_DB_URL.startswith("postgres://") or RAW_DB_URL.startswith("postgresql://"):
    # Fix for Supabase connection strings
    prefix = "postgresql+asyncpg://"
    if RAW_DB_URL.startswith("postgres://"):
        DATABASE_URL = RAW_DB_URL.replace("postgres://", prefix, 1)
    else:
        DATABASE_URL = RAW_DB_URL.replace("postgresql://", prefix, 1)
    
    # Ensure sslmode is handled if not present but needed for Supabase
    if "sslmode" not in DATABASE_URL:
        if "?" in DATABASE_URL:
            DATABASE_URL += "&sslmode=require"
        else:
            DATABASE_URL += "?sslmode=require"
else:
    DATABASE_URL = RAW_DB_URL

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
