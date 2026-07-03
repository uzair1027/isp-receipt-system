from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database.base import BaseModel


class CustomerNote(BaseModel):
    __tablename__ = "customer_notes"
    
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    
    customer = relationship("Customer", back_populates="notes")
    author = relationship("User", back_populates="notes")
    
    def __repr__(self) -> str:
        return f"<CustomerNote(id={self.id}, title='{self.title}', customer_id={self.customer_id})>"
