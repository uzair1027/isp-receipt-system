from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from ...core.dependencies import get_current_user, get_db
from ...models.user import User
from ...models.payment import Payment
from ...models.customer import Customer

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/daily")
def daily_report(
    report_date: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily collection report."""
    target_date = datetime.strptime(report_date, "%Y-%m-%d").date() if report_date else date.today()
    
    payments = db.query(Payment).filter(Payment.payment_date == target_date).all()
    
    total = sum(p.amount_paid for p in payments)
    by_method = {}
    for p in payments:
        method = p.payment_method.value
        by_method[method] = by_method.get(method, 0) + p.amount_paid
    
    return {
        "date": str(target_date),
        "total_collection": total,
        "total_payments": len(payments),
        "by_method": by_method,
        "payments": [{
            "receipt_number": p.receipt_number,
            "customer_name": db.query(Customer).filter(Customer.id == p.customer_id).first().full_name if db.query(Customer).filter(Customer.id == p.customer_id).first() else "N/A",
            "amount": p.amount_paid,
            "method": p.payment_method.value,
            "time": p.created_at.strftime("%H:%M"),
        } for p in payments[:50]]
    }


@router.get("/monthly")
def monthly_report(
    year: int = Query(None),
    month: int = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monthly collection report."""
    today = date.today()
    y = year or today.year
    m = month or today.month
    
    payments = db.query(Payment).filter(
        func.extract('year', Payment.payment_date) == y,
        func.extract('month', Payment.payment_date) == m
    ).all()
    
    total = sum(p.amount_paid for p in payments)
    
    return {
        "year": y,
        "month": m,
        "total_collection": total,
        "total_payments": len(payments),
        "daily_breakdown": _daily_breakdown(payments),
    }


def _daily_breakdown(payments):
    breakdown = {}
    for p in payments:
        day = str(p.payment_date)
        if day not in breakdown:
            breakdown[day] = {"total": 0, "count": 0}
        breakdown[day]["total"] += p.amount_paid
        breakdown[day]["count"] += 1
    return breakdown
