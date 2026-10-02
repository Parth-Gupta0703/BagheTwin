"""
SIH26120 Database Connection & Session Management
SQLAlchemy engine initialization with automatic connection handling for both
PostgreSQL and local SQLite fallback.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

db_url = settings.DATABASE_URL
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in database if they don't already exist."""
    import app.models.db_models  # Ensure models are imported
    Base.metadata.create_all(bind=engine)
