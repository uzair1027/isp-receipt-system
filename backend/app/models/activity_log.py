from sqlalchemy import Column, String, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from ..database.base import BaseModel
from ..core.enums import ActivityType


class ActivityLog(BaseModel):
    __tablename__ = "activity_logs"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    activity_type = Column(SQLEnum(ActivityType), nullable=False, index=True)
    description = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    metadata_json = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="activities")
    
    def __repr__(self) -> str:
        return f"<ActivityLog(id={self.id}, type='{self.activity_type}', user_id={self.user_id})>"
