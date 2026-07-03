import logging
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
from ..repositories.payment_repository import PaymentRepository
from ..repositories.customer_repository import CustomerRepository
from ..schemas.payment import PaymentCreate, PaymentResponse
from ..utils.helpers import get_current_year
from ..core.constants import RECEIPT_PREFIX

logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PaymentRepository(db)
        self.customer_repo = CustomerRepository(db)
    
    def generate_receipt_number(self) -> str:
        year = get_current_year()
        last = self.repo.get_last_receipt_number(RECEIPT_PREFIX, year)
        if last:
            seq = int(last.split('-')[-1]) + 1
        else:
            seq = 1
        return f"{RECEIPT_PREFIX}-{year}-{seq:06d}"
    
    def create_payment(self, payment_data: PaymentCreate, user_id: int) -> PaymentResponse:
        receipt_number = self.generate_receipt_number()
        
        payment_dict = payment_data.model_dump()
        payment_dict['receipt_number'] = receipt_number
        payment_dict['collected_by'] = user_id
        
        payment = self.repo.create(payment_dict)
        logger.info(f"Payment created: {receipt_number} - Rs.{payment_data.amount_paid}")
        return PaymentResponse.model_validate(payment)
    
    def get_customer_payments(self, customer_id: int) -> List[PaymentResponse]:
        payments = self.repo.get_by_customer(customer_id)
        return [PaymentResponse.model_validate(p) for p in payments]
    
    def get_payment(self, payment_id: int) -> PaymentResponse:
        payment = self.repo.get_by_id(payment_id)
        return PaymentResponse.model_validate(payment)
    
    def get_today_stats(self) -> dict:
        return {
            "today_total": self.repo.get_today_total(),
            "today_count": self.repo.get_today_count(),
        }
    
    def get_monthly_stats(self, year: int, month: int) -> float:
        return self.repo.get_monthly_total(year, month)
