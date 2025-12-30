from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

database_url = settings.DATABASE_URL

# Supabase Postgres requires SSL. If user didn't include sslmode in DATABASE_URL,
# we enforce it for supabase hosts (direct + pooler) to avoid confusing connection failures.
connect_args = {}
if any(h in (database_url or "") for h in ("supabase.co", "supabase.com")) and "sslmode=" not in database_url:
    connect_args = {"sslmode": "require"}

# Production-ready connection pool configuration for 1000+ concurrent users
# Using QueuePool with optimized settings
engine = create_engine(
    database_url,
    poolclass=QueuePool,
    pool_pre_ping=True,  # Verify connections before use
    pool_size=settings.DB_POOL_SIZE,  # Base pool size
    max_overflow=settings.DB_MAX_OVERFLOW,  # Additional connections when pool is exhausted
    pool_timeout=settings.DB_POOL_TIMEOUT,  # Timeout waiting for connection
    pool_recycle=settings.DB_POOL_RECYCLE,  # Recycle connections to prevent stale connections
    echo=settings.DEBUG,  # SQL logging in debug mode
    connect_args=connect_args,
)

# Connection pool event listeners for monitoring
@event.listens_for(engine, "connect")
def on_connect(dbapi_conn, connection_record):
    logger.debug("New database connection established")

@event.listens_for(engine, "checkout")
def on_checkout(dbapi_conn, connection_record, connection_proxy):
    logger.debug("Connection checked out from pool")

@event.listens_for(engine, "checkin")
def on_checkin(dbapi_conn, connection_record):
    logger.debug("Connection returned to pool")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Database session dependency with proper cleanup.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_pool_status():
    """Get current connection pool status for monitoring."""
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "invalid": pool.invalidatedcount() if hasattr(pool, 'invalidatedcount') else 0,
    }
