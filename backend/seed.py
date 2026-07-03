import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.services.auth_service import AuthService
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.company_settings import CompanySettings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database():
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    db = SessionLocal()
    try:
        auth_service = AuthService(db)
        auth_service.seed_admin()
        
        cashier = db.query(User).filter(User.username == "cashier").first()
        if not cashier:
            cashier = User(
                username="cashier",
                full_name="Default Cashier",
                password_hash=get_password_hash("cashier123"),
                role=UserRole.CASHIER
            )
            db.add(cashier)
            db.commit()
            logger.info("Cashier created: cashier / cashier123")
        
        settings = db.query(CompanySettings).first()
        if not settings:
            settings = CompanySettings(
                company_name="My ISP Company",
                address="123 Main Street, City",
                phone="+92-300-1234567",
                email="info@myisp.com",
                receipt_footer="Thank you for your payment!",
                currency_symbol="Rs.",
                receipt_prefix="RCP"
            )
            db.add(settings)
            db.commit()
            logger.info("Company settings created")
        
        logger.info("Seeding complete!")
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
