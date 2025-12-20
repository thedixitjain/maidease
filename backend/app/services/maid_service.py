from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.user import User, UserRole
from fastapi import HTTPException


class MaidService:
    def __init__(self, db: Session):
        self.db = db
    
    def search_maids(
        self,
        skill: Optional[str] = None,
        min_experience: Optional[int] = None,
        max_rate: Optional[float] = None
    ) -> List[User]:
        query = self.db.query(User).filter(
            and_(
                User.role == UserRole.MAID,
                User.is_active == True
            )
        )
        
        if skill:
            query = query.filter(User.skills.contains(skill))
        
        if min_experience is not None:
            query = query.filter(User.experience_years >= min_experience)
        
        if max_rate is not None:
            query = query.filter(User.hourly_rate <= max_rate)
        
        return query.all()
    
    def get_maid_by_id(self, maid_id: UUID) -> User:
        maid = self.db.query(User).filter(
            and_(
                User.id == maid_id,
                User.role == UserRole.MAID
            )
        ).first()
        
        if not maid:
            raise HTTPException(status_code=404, detail="Maid not found")
        
        return maid
