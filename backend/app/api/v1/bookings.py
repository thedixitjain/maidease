from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse, BookingUpdate
from app.services.booking_service import BookingService
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new booking (Customer only)
    """
    booking_service = BookingService(db)
    booking = booking_service.create_booking(current_user.id, booking_data)
    return booking


@router.get("/my-bookings", response_model=List[BookingResponse])
def get_my_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all bookings for current user (Customer or Maid)
    """
    booking_service = BookingService(db)
    bookings = booking_service.get_user_bookings(current_user.id, current_user.role)
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_detail(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get booking details by ID (Customer or Maid can view their own bookings)
    """
    booking_service = BookingService(db)
    booking = booking_service.get_booking_detail(booking_id, current_user)
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_status(
    booking_id: UUID,
    booking_update: BookingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update booking status (accept/reject/complete/cancel)
    """
    booking_service = BookingService(db)
    booking = booking_service.update_booking(booking_id, current_user, booking_update)
    return booking
