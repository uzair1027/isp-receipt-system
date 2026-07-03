import logging
from sqlalchemy.orm import Session
from typing import List
from ..repositories.customer_repository import CustomerRepository
from ..schemas.customer import CustomerResponse

logger = logging.getLogger(__name__)


class CustomerService:
    def update_customer(self, customer_id: int, data: dict):
        from datetime import date
        if 'expiry_date' in data and data['expiry_date']:
            try:
                data['expiry_date'] = date.fromisoformat(data['expiry_date'])
            except:
                pass
        customer = self.repo.update(customer_id, data)
        return CustomerResponse.model_validate(customer)

    def __init__(self, db: Session):
        self.db = db
        self.repo = CustomerRepository(db)
    
    def search_customers(self, query: str, limit: int = 20) -> List[CustomerResponse]:
        customers = self.repo.search(query, limit)
        return [CustomerResponse.model_validate(c) for c in customers]
    
    def get_customer(self, customer_id: int) -> CustomerResponse:
        customer = self.repo.get_by_id(customer_id)
        return CustomerResponse.model_validate(customer)
    
    def get_all_customers(self, page: int = 1, page_size: int = 20) -> dict:
        skip = (page - 1) * page_size
        customers = self.repo.get_all(skip=skip, limit=page_size)
        total = self.repo.count_all()
        return {
            "customers": [CustomerResponse.model_validate(c) for c in customers],
            "total": total,
            "page": page,
            "page_size": page_size
        }
