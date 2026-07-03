from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class PaymentCreate(BaseModel):
    customer_id: int
    billing_month: str = Field(..., pattern=r'^\d{4}-\d{2}$', description="Format: YYYY-MM")
    amount_paid: float = Field(..., gt=0)
    payment_method: str = Field(..., pattern="^(cash|bank|jazzcash|easypaisa|other)$")
    payment_note: Optional[str] = None
    signature_data: Optional[str] = None
    payment_date: date


class PaymentResponse(BaseModel):
    id: int
    receipt_number: str
    customer_id: int
    billing_month: str
    amount_paid: float
    payment_method: str
    payment_note: Optional[str] = None
    signature_data: Optional[str] = None
    collected_by: int
    payment_date: date
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    payments: list[PaymentResponse]
    total: int
