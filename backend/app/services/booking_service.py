from typing import List
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreate, BookingUpdate
import re


class BookingService:
    def __init__(self, db: Session):
        self.db = db
    
    def _extract_proposed_rate(self, notes: str) -> float:
        """Extract proposed hourly rate from notes. Format: 'Proposed Hourly Rate: $XX.XX'"""
        if not notes:
            return None
        
        match = re.search(r'Proposed Hourly Rate:\s*\$?([\d.]+)', notes)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None
        return None
    
    def create_booking(self, customer_id: UUID, booking_data: BookingCreate) -> Booking:
        booking = Booking(
            customer_id=customer_id,
            maid_id=booking_data.maid_id,
            service_type=booking_data.service_type,
            booking_date=booking_data.booking_date,
            time_slot=booking_data.time_slot,
            notes=booking_data.notes,
            status=BookingStatus.PENDING
        )
        
        # Extract proposed rate from notes and calculate total_amount if provided
        proposed_rate = self._extract_proposed_rate(booking_data.notes)
        if proposed_rate:
            booking.total_amount = proposed_rate
        else:
            # Use maid's hourly rate if no proposed rate
            maid = self.db.query(User).filter(User.id == booking_data.maid_id).first()
            if maid and maid.hourly_rate:
                booking.total_amount = maid.hourly_rate
        
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        
        return booking
    
    def get_user_bookings(self, user_id: UUID, role: UserRole) -> List[Booking]:
        query = self.db.query(Booking).options(
            joinedload(Booking.customer),
            joinedload(Booking.maid)
        )
        if role == UserRole.CUSTOMER or role == "customer":
            return query.filter(Booking.customer_id == user_id).all()
        else:  # MAID - role == UserRole.MAID or role == "maid"
            return query.filter(Booking.maid_id == user_id).all()
    
    def get_booking_detail(self, booking_id: UUID, current_user: User) -> Booking:
        """Get booking details if user is authorized (customer or assigned maid)"""
        booking = self.db.query(Booking).options(
            joinedload(Booking.customer),
            joinedload(Booking.maid)
        ).filter(Booking.id == booking_id).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Verify user has permission to view
        if current_user.role == UserRole.CUSTOMER and booking.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this booking")
        
        if current_user.role == UserRole.MAID and booking.maid_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this booking")
        
        return booking
    
    def update_booking(self, booking_id: UUID, current_user: User, booking_update: BookingUpdate) -> Booking:
        booking = self.db.query(Booking).filter(Booking.id == booking_id).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Verify user has permission to update
        if current_user.role == UserRole.CUSTOMER and booking.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if current_user.role == UserRole.MAID and booking.maid_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        update_data = booking_update.model_dump(exclude_unset=True)
        old_status = booking.status
        
        for field, value in update_data.items():
            setattr(booking, field, value)
        
        self.db.commit()
        self.db.refresh(booking)
        
        return booking
