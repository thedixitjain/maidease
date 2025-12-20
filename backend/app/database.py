from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

database_url = settings.DATABASE_URL

# Supabase Postgres requires SSL. If user didn't include sslmode in DATABASE_URL,
# we enforce it for supabase hosts (direct + pooler) to avoid confusing connection failures.
connect_args = {}
if any(h in (database_url or "") for h in ("supabase.co", "supabase.com")) and "sslmode=" not in database_url:
    connect_args = {"sslmode": "require"}

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
