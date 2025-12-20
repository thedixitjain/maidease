from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Allow extra keys in .env (e.g. CORS_ORIGINS) without crashing startup
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "MaidEase"
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database - from Supabase
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Optional: provide comma-separated CORS origins via .env as CORS_ORIGINS=...
    # (We parse it below into BACKEND_CORS_ORIGINS)
    CORS_ORIGINS: Optional[str] = None
    
    # CORS - allow production and local URLs (will be overridden by environment)
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://maidease-two.vercel.app",
        "http://localhost:5173",  # For local development
        "http://localhost:3000",   # For local development
    ]
    
settings = Settings()

# Load CORS origins from environment if set
cors_env = settings.CORS_ORIGINS or os.getenv("CORS_ORIGINS", "")
if cors_env:
    # Handle both comma-separated and single values
    cors_urls = [url.strip() for url in cors_env.split(",") if url.strip()]
    settings.BACKEND_CORS_ORIGINS = cors_urls
    logger.info(f"Loaded CORS origins from CORS_ORIGINS: {cors_urls}")
else:
    logger.warning(f"CORS_ORIGINS not set, using defaults: {settings.BACKEND_CORS_ORIGINS}")

logger.info(f"Final CORS origins configured: {settings.BACKEND_CORS_ORIGINS}")

