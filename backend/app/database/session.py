from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from ..core.config import database_config

if "sqlite" in database_config.DATABASE_URL:
    engine = create_engine(
        database_config.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=database_config.DB_ECHO
    )
else:
    engine = create_engine(
        database_config.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=database_config.DB_POOL_SIZE,
        max_overflow=database_config.DB_MAX_OVERFLOW,
        echo=database_config.DB_ECHO
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
