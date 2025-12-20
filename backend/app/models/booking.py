from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum
import uuid


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELED = "canceled"


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    maid_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    service_type = Column(String, nullable=False)
    booking_date = Column(DateTime, nullable=False)
    time_slot = Column(String)
    status = Column(Enum(BookingStatus, values_callable=lambda x: [e.value for e in x]), default=BookingStatus.PENDING)
    total_amount = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship(
        "User",
        back_populates="bookings_as_customer",
        foreign_keys=[customer_id]
    )
    maid = relationship(
        "User",
        back_populates="bookings_as_maid",
        foreign_keys=[maid_id]
    )
    review = relationship(
        "Review",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan"
    )
