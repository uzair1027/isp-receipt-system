from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ...schemas.import_log import ImportLogResponse, ImportResultResponse
from ...services.csv_import_service import CSVImportService
from ...repositories.import_repository import ImportRepository
from ...core.dependencies import get_current_admin, get_db
from ...models.user import User

router = APIRouter(prefix="/imports", tags=["CSV Import"])


@router.post("/csv", response_model=ImportResultResponse)
async def import_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Import customers from a Zima.cloud CSV file (Admin only)."""
    content = await file.read()
    service = CSVImportService(db)
    return service.import_csv(content, file.filename, current_user.id)


@router.get("/history", response_model=List[ImportLogResponse])
def get_import_history(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get CSV import history (Admin only)."""
    repo = ImportRepository(db)
    return repo.get_all()
