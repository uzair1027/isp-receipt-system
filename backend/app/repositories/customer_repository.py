from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..models.customer import Customer
from ..core.exceptions import NotFoundError


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, customer_id: int) -> Customer:
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise NotFoundError(f"Customer with ID {customer_id} not found")
        return customer
    
    def get_by_device_ppp(self, device_ppp: str) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.device_ppp == device_ppp).first()
    
    def search(self, query: str, limit: int = 20) -> List[Customer]:
        search_term = f"%{query}%"
        return self.db.query(Customer).filter(
            or_(
                Customer.device_ppp.ilike(search_term),
                Customer.full_name.ilike(search_term),
                Customer.username.ilike(search_term),
                Customer.mobile_phone.ilike(search_term),
                Customer.address.ilike(search_term),
                Customer.service_plan.ilike(search_term),
            ),
            Customer.is_active == True
        ).limit(limit).all()
    
    def get_all(self, skip: int = 0, limit: int = 20) -> List[Customer]:
        return self.db.query(Customer).filter(
            Customer.is_active == True
        ).offset(skip).limit(limit).all()
    
    def count_all(self) -> int:
        return self.db.query(Customer).filter(Customer.is_active == True).count()
    
    def create(self, customer_data: dict) -> Customer:
        customer = Customer(**customer_data)
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer
    
    def update(self, customer_id: int, update_data: dict) -> Customer:
        customer = self.get_by_id(customer_id)
        for key, value in update_data.items():
            if hasattr(customer, key) and value is not None:
                setattr(customer, key, value)
        self.db.commit()
        self.db.refresh(customer)
        return customer
