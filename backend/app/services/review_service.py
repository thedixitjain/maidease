from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.review import Review
from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole
from app.schemas.review import ReviewCreate


class ReviewService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_review(self, customer_id: UUID, review_data: ReviewCreate) -> Review:
        # Verify booking exists and belongs to customer
        booking = self.db.query(Booking).filter(
            Booking.id == review_data.booking_id,
            Booking.customer_id == customer_id,
            Booking.status == BookingStatus.COMPLETED
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or not completed"
            )
        
        # Check if review already exists
        existing_review = self.db.query(Review).filter(
            Review.booking_id == review_data.booking_id
        ).first()
        
        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review already exists for this booking"
            )
        
        # Create review
        review = Review(
            booking_id=review_data.booking_id,
            customer_id=customer_id,
            maid_id=booking.maid_id,
            rating=review_data.rating,
            comment=review_data.comment
        )
        
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        # Update maid's average rating
        self._update_maid_rating(booking.maid_id)
        
        return review
    
    def get_maid_reviews(self, maid_id: UUID) -> List[Review]:
        return self.db.query(Review).filter(Review.maid_id == maid_id).all()
    
    def get_booking_review(self, booking_id: UUID, current_user: User) -> Review:
        """Get review for a specific booking. Only customer can view their reviews."""
        review = self.db.query(Review).filter(Review.booking_id == booking_id).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No review found for this booking"
            )
        
        # Only the customer who gave the review can view it
        if review.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this review"
            )
        
        return review
    
    def _update_maid_rating(self, maid_id: UUID):
        from sqlalchemy import func
        avg_rating = self.db.query(func.avg(Review.rating)).filter(
            Review.maid_id == maid_id
        ).scalar()
        
        maid = self.db.query(User).filter(User.id == maid_id).first()
        if maid and avg_rating:
            maid.average_rating = round(avg_rating, 2)
            self.db.commit()
