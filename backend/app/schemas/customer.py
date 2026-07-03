from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class CustomerBase(BaseModel):
    device_ppp: str
    username: Optional[str] = None
    full_name: str
    service_plan: Optional[str] = None
    mobile_phone: Optional[str] = None
    address: Optional[str] = None
    street: Optional[str] = None
    email: Optional[str] = None
    national_id: Optional[str] = None
    mac_address: Optional[str] = None
    comments: Optional[str] = None
    expiry_date: Optional[date] = None
    is_active: bool = True


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CustomerSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")


class CustomerListResponse(BaseModel):
    customers: list[CustomerResponse]
    total: int
    page: int
    page_size: int
