from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.dependencies import get_current_admin, get_db
from ...models.user import User
from ...models.company_settings import CompanySettings
from ...core.enums import ActivityType
from ...services.activity_log_service import ActivityLogService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/")
def get_settings(current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {
        "company_name": settings.company_name,
        "address": settings.address or "",
        "phone": settings.phone or "",
        "email": settings.email or "",
        "website": settings.website or "",
        "receipt_footer": settings.receipt_footer or "",
        "currency_symbol": settings.currency_symbol or "Rs.",
        "receipt_prefix": settings.receipt_prefix or "RCP",
    }


@router.put("/")
def update_settings(data: dict, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings()
        db.add(settings)
    
    for key in ["company_name", "address", "phone", "email", "website", "receipt_footer", "currency_symbol", "receipt_prefix"]:
        if key in data:
            setattr(settings, key, data[key])
    
    db.commit()
    
    ActivityLogService(db).log(current_user, ActivityType.SETTINGS_UPDATED, "Company settings updated")
    return {"message": "Settings updated"}
