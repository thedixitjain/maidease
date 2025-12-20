from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    role: UserRole


class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password must be 8-128 characters"
    )
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password meets security requirements"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        if len(v.encode('utf-8')) > 128:
            raise ValueError('Password is too long (max 128 characters)')
        
        # Check for at least one letter and one number
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        
        if not has_letter or not has_digit:
            raise ValueError('Password must contain at least one letter and one number')
        
        return v
    
    @field_validator('full_name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate and clean the name"""
        v = v.strip()
        if not v:
            raise ValueError('Name cannot be empty')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = Field(None, max_length=500)
    skills: Optional[str] = Field(None, max_length=200)
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    hourly_rate: Optional[float] = Field(None, ge=0, le=10000)
    availability_schedule: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    bio: Optional[str] = None
    skills: Optional[str] = None
    experience_years: Optional[int] = None
    hourly_rate: Optional[float] = None
    average_rating: Optional[float] = None
    availability_schedule: Optional[str] = None
    
    class Config:
        from_attributes = True
