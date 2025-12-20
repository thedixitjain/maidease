from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def update_user(self, user_id: UUID, user_update: UserUpdate) -> User:
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
