from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime
from ..models.payment import Payment, PaymentMethod
from ..core.exceptions import NotFoundError


class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, payment_id: int) -> Payment:
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise NotFoundError(f"Payment with ID {payment_id} not found")
        return payment
    
    def get_by_receipt_number(self, receipt_number: str) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.receipt_number == receipt_number).first()
    
    def get_by_customer(self, customer_id: int) -> List[Payment]:
        return self.db.query(Payment).filter(
            Payment.customer_id == customer_id
        ).order_by(Payment.payment_date.desc()).all()
    
    def get_last_receipt_number(self, prefix: str, year: int) -> Optional[str]:
        last = self.db.query(Payment).filter(
            Payment.receipt_number.like(f"{prefix}-{year}-%")
        ).order_by(Payment.id.desc()).first()
        return last.receipt_number if last else None
    
    def get_today_total(self) -> float:
        today = date.today()
        result = self.db.query(func.sum(Payment.amount_paid)).filter(
            Payment.payment_date == today
        ).scalar()
        return result or 0.0
    
    def get_today_count(self) -> int:
        today = date.today()
        return self.db.query(Payment).filter(Payment.payment_date == today).count()
    
    def get_monthly_total(self, year: int, month: int) -> float:
        result = self.db.query(func.sum(Payment.amount_paid)).filter(
            func.extract('year', Payment.payment_date) == year,
            func.extract('month', Payment.payment_date) == month
        ).scalar()
        return result or 0.0
    
    def create(self, payment_data: dict) -> Payment:
        payment = Payment(**payment_data)
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment
