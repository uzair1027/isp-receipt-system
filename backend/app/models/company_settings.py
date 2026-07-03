from sqlalchemy import Column, String, Text
from ..database.base import BaseModel


class CompanySettings(BaseModel):
    __tablename__ = "company_settings"
    
    company_name = Column(String(200), nullable=False, default="ISP Company")
    logo_path = Column(String(500), nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(200), nullable=True)
    website = Column(String(200), nullable=True)
    receipt_footer = Column(Text, nullable=True, default="Thank you for your payment!")
    currency_symbol = Column(String(10), nullable=False, default="Rs.")
    receipt_prefix = Column(String(20), nullable=False, default="RCP")
    
    def __repr__(self) -> str:
        return f"<CompanySettings(company_name='{self.company_name}')>"
