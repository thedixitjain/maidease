from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.core.rate_limiter import rate_limit_middleware, rate_limiter
from app.api.v1 import auth, users, maids, bookings, reviews
from app.database import engine, Base, get_pool_status
from app.services.demo_service import DemoService

# Import all models
from app.models.user import User
from app.models.booking import Booking
from app.models.review import Review
import logging
import sys
import time

# Configure logging - important for production debugging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger(__name__)

# Note: Database tables are managed via Supabase SQL scripts (database/init.sql)
# Tables are pre-created and should NOT be auto-created here to avoid conflicts

app = FastAPI(
    title=settings.APP_NAME,
    description="MaidEase API - Professional cleaning service booking platform",
    version="2.0.0",
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False  # Disable trailing slash redirect to preserve CORS headers on redirects
)

logger.info(f"Starting {settings.APP_NAME} API v2.0.0")
logger.info(f"DEBUG mode: {settings.DEBUG}")
logger.info(f"Demo mode: {settings.DEMO_ENABLED}")
logger.info(f"DATABASE_URL configured: {settings.DATABASE_URL[:50]}..." if settings.DATABASE_URL else "No DATABASE_URL")
logger.info(f"DB Pool Size: {settings.DB_POOL_SIZE}, Max Overflow: {settings.DB_MAX_OVERFLOW}")

# CORS configuration - production ready
allowed_origins = settings.BACKEND_CORS_ORIGINS
logger.info(f"CORS Origins: {allowed_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)


# Request timing middleware for performance monitoring
class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}"
        
        # Log slow requests (> 1 second)
        if process_time > 1.0:
            logger.warning(f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s")
        
        return response


# Add middlewares
app.add_middleware(TimingMiddleware)
app.middleware("http")(rate_limit_middleware)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(maids.router, prefix=settings.API_V1_PREFIX)
app.include_router(bookings.router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews.router, prefix=settings.API_V1_PREFIX)

logger.info(f"API v1 routes registered at prefix: {settings.API_V1_PREFIX}")


@app.on_event("startup")
async def startup_event():
    """Initialize demo accounts on startup."""
    logger.info("Running startup tasks...")
    
    if settings.DEMO_ENABLED:
        try:
            from app.database import SessionLocal
            db = SessionLocal()
            try:
                demo_service = DemoService(db)
                result = demo_service.ensure_demo_accounts_exist()
                logger.info(f"Demo accounts initialized: {result}")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Failed to initialize demo accounts: {e}")
    
    logger.info("Startup tasks completed")


@app.get("/")
def root():
    logger.info("Root endpoint called")
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": "2.0.0",
        "docs": "/docs",
        "demo_enabled": settings.DEMO_ENABLED,
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint with detailed system status.
    Useful for load balancers and monitoring systems.
    """
    pool_status = get_pool_status()
    
    return {
        "status": "healthy",
        "version": "2.0.0",
        "database": {
            "pool_size": pool_status["pool_size"],
            "connections_in_use": pool_status["checked_out"],
            "connections_available": pool_status["checked_in"],
        },
        "features": {
            "demo_mode": settings.DEMO_ENABLED,
            "rate_limiting": True,
        }
    }


@app.get("/metrics")
async def get_metrics():
    """
    Metrics endpoint for monitoring and observability.
    Returns rate limiter and connection pool statistics.
    """
    pool_status = get_pool_status()
    rate_stats = await rate_limiter.get_stats()
    
    return {
        "database_pool": pool_status,
        "rate_limiter": rate_stats,
    }
