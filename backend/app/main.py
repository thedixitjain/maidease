from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, maids, bookings, reviews
from app.database import engine, Base

# Import all models
from app.models.user import User
from app.models.booking import Booking
from app.models.review import Review
import logging
import sys

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
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False  # Disable trailing slash redirect to preserve CORS headers on redirects
)

logger.info(f"Starting {settings.APP_NAME} API")
logger.info(f"DEBUG mode: {settings.DEBUG}")
logger.info(f"DATABASE_URL configured: {settings.DATABASE_URL[:50]}..." if settings.DATABASE_URL else "No DATABASE_URL")

# CORS configuration - production ready
allowed_origins = settings.BACKEND_CORS_ORIGINS
logger.info(f"CORS Origins: {allowed_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(maids.router, prefix=settings.API_V1_PREFIX)
app.include_router(bookings.router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews.router, prefix=settings.API_V1_PREFIX)

logger.info(f"API v1 routes registered at prefix: {settings.API_V1_PREFIX}")


@app.get("/")
def root():
    logger.info("Root endpoint called")
    return {"message": f"Welcome to {settings.APP_NAME} API"}


@app.get("/health")
def health_check():
    logger.debug("Health check called")
    return {"status": "healthy"}
