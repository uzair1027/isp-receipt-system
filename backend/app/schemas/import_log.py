from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ImportLogResponse(BaseModel):
    id: int
    file_name: str
    imported_by: int
    total_rows: int
    imported_count: int
    updated_count: int
    skipped_count: int
    error_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ImportResultResponse(BaseModel):
    success: bool
    import_log: ImportLogResponse
    message: str
