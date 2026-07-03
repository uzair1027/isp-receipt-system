from sqlalchemy import Column, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from ..database.base import BaseModel
from ..core.enums import UserRole


class User(BaseModel):
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.CASHIER)
    is_active = Column(Boolean, default=True, nullable=False)
    
    activities = relationship("ActivityLog", back_populates="user", lazy="dynamic")
    payments = relationship("Payment", back_populates="cashier", lazy="dynamic")
    notes = relationship("CustomerNote", back_populates="author", lazy="dynamic")
    imports = relationship("ImportLog", back_populates="user", lazy="dynamic")
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
    
    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN
