from sqlalchemy import Column, String, Integer, Float, Date, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database.base import BaseModel
from ..core.enums import PaymentMethod


class Payment(BaseModel):
    __tablename__ = "payments"
    
    receipt_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True)
    billing_month = Column(String(20), nullable=False, index=True)
    amount_paid = Column(Float, nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_note = Column(Text, nullable=True)
    signature_data = Column(Text, nullable=True)
    collected_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    payment_date = Column(Date, nullable=False, index=True)
    
    customer = relationship("Customer", back_populates="payments")
    cashier = relationship("User", back_populates="payments")
    
    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, receipt='{self.receipt_number}', amount={self.amount_paid})>"
