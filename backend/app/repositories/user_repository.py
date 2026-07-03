from sqlalchemy.orm import Session
from typing import Optional, List
from ..models.user import User, UserRole
from ..core.exceptions import NotFoundError, ConflictError


class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError(f"User with ID {user_id} not found")
        return user
    
    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()
    
    def get_active_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.username == username,
            User.is_active == True
        ).first()
    
    def get_all_active(self) -> List[User]:
        return self.db.query(User).filter(User.is_active == True).all()
    
    def create(self, user_data: dict) -> User:
        if self.get_by_username(user_data["username"]):
            raise ConflictError(f"Username '{user_data['username']}' already exists")
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update(self, user_id: int, update_data: dict) -> User:
        user = self.get_by_id(user_id)
        for key, value in update_data.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user
