from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from ...services.payment_service import PaymentService
from ...core.dependencies import get_current_user, get_db
from ...models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics."""
    service = PaymentService(db)
    today_stats = service.get_today_stats()
    monthly = service.get_monthly_stats(date.today().year, date.today().month)
    
    return {
        "today_collection": today_stats["today_total"],
        "monthly_collection": monthly,
        "payments_today": today_stats["today_count"],
    }
