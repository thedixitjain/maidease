from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.user import UserResponse
from app.services.maid_service import MaidService
from app.api.deps import get_current_active_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/maids", tags=["Maids"])


@router.get("", response_model=List[UserResponse])
def browse_maids(
    skill: Optional[str] = Query(None),
    min_experience: Optional[int] = Query(None),
    max_rate: Optional[float] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Browse and search for available maids with filters (Customers only)
    """
    # Only customers can browse maids
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can browse maids"
        )
    
    maid_service = MaidService(db)
    maids = maid_service.search_maids(
        skill=skill,
        min_experience=min_experience,
        max_rate=max_rate
    )
    return maids


@router.get("/{maid_id}", response_model=UserResponse)
def get_maid_profile(
    maid_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed maid profile (Customers only)
    """
    # Only customers can view maid profiles
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can view maid profiles"
        )
    
    maid_service = MaidService(db)
    maid = maid_service.get_maid_by_id(maid_id)
    return maid
