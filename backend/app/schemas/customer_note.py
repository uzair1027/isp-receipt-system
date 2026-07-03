from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    customer_id: int
    title: str
    message: str


class NoteResponse(BaseModel):
    id: int
    customer_id: int
    title: str
    message: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
