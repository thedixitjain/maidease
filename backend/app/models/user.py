from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum
import uuid


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    MAID = "maid"


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String)
    role = Column(Enum(UserRole, values_callable=lambda x: [e.value for e in x]), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Maid-specific fields
    bio = Column(Text)
    skills = Column(String)
    experience_years = Column(Integer)
    hourly_rate = Column(Float)
    availability_schedule = Column(Text)
    average_rating = Column(Float, default=0.0)
    
    # Relationships - Use string references
    bookings_as_customer = relationship(
        "Booking",
        back_populates="customer",
        foreign_keys="Booking.customer_id",
        lazy="dynamic"
    )
    bookings_as_maid = relationship(
        "Booking",
        back_populates="maid",
        foreign_keys="Booking.maid_id",
        lazy="dynamic"
    )
    reviews_given = relationship(
        "Review",
        back_populates="customer",
        foreign_keys="Review.customer_id",
        lazy="dynamic"
    )
    reviews_received = relationship(
        "Review",
        back_populates="maid",
        foreign_keys="Review.maid_id",
        lazy="dynamic"
    )
