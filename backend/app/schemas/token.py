from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None
    token_type: Optional[str] = None  # "access" or "refresh"


class TokenRefresh(BaseModel):
    refresh_token: str
