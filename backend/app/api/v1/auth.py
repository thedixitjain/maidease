from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token, TokenRefresh
from app.services.auth_service import AuthService
from app.services.demo_service import DemoService
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (Customer or Maid)
    """
    try:
        logger.info(f"Registration attempt: email={user_data.email}, role={user_data.role}")
        auth_service = AuthService(db)
        user = auth_service.register_user(user_data)
        logger.info(f"Registration successful: user_id={user.id}, email={user.email}")
        return user
    except ValueError as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password to get JWT tokens
    Returns both access_token and refresh_token
    """
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, refresh_token = auth_service.create_tokens(
        data={"user_id": str(user.id), "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.get("/demo/credentials")
def get_demo_credentials(db: Session = Depends(get_db)):
    """
    Get demo account credentials for easy access.
    Returns demo login information for recruiters and potential users.
    """
    if not settings.DEMO_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo mode is not enabled"
        )
    
    demo_service = DemoService(db)
    # Ensure demo accounts exist
    demo_service.ensure_demo_accounts_exist()
    
    return demo_service.get_demo_credentials()


@router.post("/demo/login", response_model=Token)
def demo_login(
    role: str = "customer",
    db: Session = Depends(get_db)
):
    """
    Quick demo login without entering credentials.
    Accepts role parameter: 'customer' or 'maid'
    """
    if not settings.DEMO_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo mode is not enabled"
        )
    
    # Validate role
    if role not in ["customer", "maid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Use 'customer' or 'maid'"
        )
    
    demo_service = DemoService(db)
    demo_service.ensure_demo_accounts_exist()
    
    # Get demo credentials
    email = settings.DEMO_CUSTOMER_EMAIL if role == "customer" else settings.DEMO_MAID_EMAIL
    password = settings.DEMO_PASSWORD
    
    # Authenticate
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(email, password)
    
    if not user:
        logger.error(f"Demo login failed for role: {role}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Demo account authentication failed"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, refresh_token = auth_service.create_tokens(
        data={"user_id": str(user.id), "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    logger.info(f"Demo login successful: role={role}, email={email}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    Returns new access_token and refresh_token
    """
    try:
        # Decode refresh token to get user info
        from app.core.security import decode_refresh_token
        from app.services.user_service import UserService
        from uuid import UUID
        
        payload = decode_refresh_token(token_data.refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id_str = payload.get("user_id")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user_service = UserService(db)
        user = user_service.get_user_by_id(UUID(user_id_str))
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create new tokens
        auth_service = AuthService(db)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token, new_refresh_token = auth_service.create_tokens(
            data={"user_id": str(user.id), "email": user.email, "role": user.role.value},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
