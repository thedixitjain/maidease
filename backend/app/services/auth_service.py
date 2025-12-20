from datetime import timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
import logging

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def register_user(self, user_data: UserCreate) -> User:
        # Check if user already exists
        logger.info(f"Checking if user exists: {user_data.email}")
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            logger.warning(f"User already exists: {user_data.email}")
            raise ValueError("Email already registered")
        
        # Create new user
        logger.info(f"Creating new user: {user_data.email}, role={user_data.role}")
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            role=user_data.role
        )
        
        logger.info(f"Saving user to database: {user_data.email}")
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        logger.info(f"User registered successfully: {db_user.id} ({user_data.email})")
        
        return db_user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def create_tokens(self, data: dict, expires_delta: Optional[timedelta] = None) -> Tuple[str, str]:
        """Create both access and refresh tokens"""
        access_token = create_access_token(data, expires_delta)
        refresh_token = create_refresh_token(data)
        return access_token, refresh_token
    
    def refresh_access_token(self, refresh_token: str, user: User) -> str:
        """Generate new access token from refresh token"""
        payload = decode_refresh_token(refresh_token)
        if not payload:
            raise ValueError("Invalid or expired refresh token")
        
        data = {
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
        access_token = create_access_token(data)
        return access_token
