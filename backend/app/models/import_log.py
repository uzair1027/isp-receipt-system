from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database.base import BaseModel


class ImportLog(BaseModel):
    __tablename__ = "import_logs"
    
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    imported_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    total_rows = Column(Integer, default=0, nullable=False)
    imported_count = Column(Integer, default=0, nullable=False)
    updated_count = Column(Integer, default=0, nullable=False)
    skipped_count = Column(Integer, default=0, nullable=False)
    error_count = Column(Integer, default=0, nullable=False)
    error_details = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="imports")
    
    def __repr__(self) -> str:
        return f"<ImportLog(id={self.id}, file='{self.file_name}', imported={self.imported_count})>"
