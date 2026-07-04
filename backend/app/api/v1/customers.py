from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...schemas.customer import CustomerResponse, CustomerListResponse
from ...services.customer_service import CustomerService
from ...core.dependencies import get_current_user, get_db
from ...models.user import User
from datetime import date

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/search", response_model=list[CustomerResponse])
def search_customers(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    return service.search_customers(q, limit)


@router.get("/public-search", response_model=list[CustomerResponse])
def public_search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    """Public search for customer portal - no auth required"""
    service = CustomerService(db)
    return service.search_customers(q, 1)


@router.get("/", response_model=CustomerListResponse)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    return service.get_all_customers(page, page_size)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    return service.get_customer(customer_id)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    if 'expiry_date' in data and data['expiry_date']:
        try:
            data['expiry_date'] = date.fromisoformat(data['expiry_date'])
        except:
            pass
    return service.update_customer(customer_id, data)