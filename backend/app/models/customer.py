from sqlalchemy import Column, String, DateTime, Text, Date, Boolean
from sqlalchemy.orm import relationship
from ..database.base import BaseModel


class Customer(BaseModel):
    __tablename__ = "customers"
    
    device_ppp = Column(String(100), unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=True, index=True)
    full_name = Column(String(200), nullable=False, index=True)
    service_plan = Column(String(200), nullable=True)
    mobile_phone = Column(String(20), nullable=True, index=True)
    address = Column(Text, nullable=True)
    street = Column(String(200), nullable=True)
    email = Column(String(200), nullable=True)
    national_id = Column(String(50), nullable=True)
    mac_address = Column(String(50), nullable=True)
    comments = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    expiry_date = Column(Date, nullable=True)
    csv_created_at = Column(DateTime(timezone=True), nullable=True)
    
    payments = relationship("Payment", back_populates="customer", lazy="dynamic")
    notes = relationship("CustomerNote", back_populates="customer", lazy="dynamic")
    
    def __repr__(self) -> str:
        return f"<Customer(id={self.id}, device_ppp='{self.device_ppp}', name='{self.full_name}')>"
    
    @property
    def is_expired(self) -> bool:
        if not self.expiry_date:
            return False
        from datetime import date
        return self.expiry_date < date.today()
