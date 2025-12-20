from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class ReviewBase(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    booking_id: UUID


class ReviewResponse(ReviewBase):
    id: UUID
    booking_id: UUID
    customer_id: UUID
    maid_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
