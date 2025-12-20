from sqlalchemy import Column, Integer, ForeignKey, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=False, unique=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    maid_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="review")
    customer = relationship(
        "User",
        back_populates="reviews_given",
        foreign_keys=[customer_id]
    )
    maid = relationship(
        "User",
        back_populates="reviews_received",
        foreign_keys=[maid_id]
    )
