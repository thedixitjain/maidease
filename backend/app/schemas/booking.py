from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    maid_id: UUID
    service_type: str
    booking_date: datetime
    time_slot: str
    notes: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None


class UserDetail(BaseModel):
    id: UUID
    full_name: str
    
    class Config:
        from_attributes = True


class BookingResponse(BookingBase):
    id: UUID
    customer_id: UUID
    status: BookingStatus
    total_amount: Optional[float] = None
    created_at: datetime
    customer: Optional[UserDetail] = None
    maid: Optional[UserDetail] = None
    
    class Config:
        from_attributes = True
