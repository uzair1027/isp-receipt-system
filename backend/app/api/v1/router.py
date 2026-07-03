from fastapi import APIRouter
from .auth import router as auth_router
from .health import router as health_router
from .customers import router as customers_router
from .payments import router as payments_router
from .dashboard import router as dashboard_router
from .imports import router as imports_router
from .receipts import router as receipts_router
from .customer_notes import router as notes_router
from .settings import router as settings_router
from .reports import router as reports_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(health_router)
api_router.include_router(customers_router)
api_router.include_router(payments_router)
api_router.include_router(dashboard_router)
api_router.include_router(imports_router)
api_router.include_router(receipts_router)
api_router.include_router(notes_router)
api_router.include_router(settings_router)
api_router.include_router(reports_router)
