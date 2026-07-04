from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ...schemas.payment import PaymentCreate, PaymentResponse
from ...services.payment_service import PaymentService
from ...core.dependencies import get_current_user, get_db
from ...models.user import User

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Collect a payment from a customer."""
    service = PaymentService(db)
    return service.create_payment(payment_data, current_user.id)


@router.get("/customer/{customer_id}", response_model=List[PaymentResponse])
def get_customer_payments(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all payments for a customer."""
    service = PaymentService(db)
    return service.get_customer_payments(customer_id)


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a payment by ID."""
    service = PaymentService(db)
    return service.get_payment(payment_id)


@router.get("/stats/today")
def get_today_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's collection stats."""
    service = PaymentService(db)
    return service.get_today_stats()

@router.get("/public/customer/{customer_id}")
def public_customer_payments(customer_id: int, db: Session = Depends(get_db)):
    """Public payment history - no auth required for portal"""
    service = PaymentService(db)
    return service.get_customer_payments(customer_id)