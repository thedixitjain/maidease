from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.review_service import ReviewService
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a review for a completed booking (Customer only)
    """
    review_service = ReviewService(db)
    review = review_service.create_review(current_user.id, review_data)
    return review


@router.get("/maid/{maid_id}", response_model=List[ReviewResponse])
def get_maid_reviews(maid_id: UUID, db: Session = Depends(get_db)):
    """
    Get all reviews for a specific maid
    """
    review_service = ReviewService(db)
    reviews = review_service.get_maid_reviews(maid_id)
    return reviews


@router.get("/check/{booking_id}")
def check_review_exists(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Check if a review exists for a booking (returns 200 with exists flag)
    This endpoint returns 200 status to avoid console errors
    """
    review_service = ReviewService(db)
    try:
        review_service.get_booking_review(booking_id, current_user)
        return {"exists": True}
    except HTTPException:
        return {"exists": False}


@router.get("/booking/{booking_id}", response_model=ReviewResponse)
def get_booking_review(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get review for a specific booking (if exists)
    Returns 404 if no review exists
    """
    review_service = ReviewService(db)
    review = review_service.get_booking_review(booking_id, current_user)
    return review
