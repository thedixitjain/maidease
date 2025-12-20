from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    """
    user_service = UserService(db)
    updated_user = user_service.update_user(current_user.id, user_update)
    return updated_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get user profile by ID (public view)
    """
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
