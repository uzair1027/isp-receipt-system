from sqlalchemy.orm import Session
from typing import List
from ..models.import_log import ImportLog


class ImportRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, import_data: dict) -> ImportLog:
        log = ImportLog(**import_data)
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
    
    def get_all(self, limit: int = 20) -> List[ImportLog]:
        return self.db.query(ImportLog).order_by(ImportLog.created_at.desc()).limit(limit).all()
    
    def get_by_id(self, import_id: int) -> ImportLog:
        return self.db.query(ImportLog).filter(ImportLog.id == import_id).first()
