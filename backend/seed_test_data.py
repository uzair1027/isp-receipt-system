import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.customer import Customer
from app.models.payment import Payment, PaymentMethod
from app.core.security import get_password_hash
from datetime import date
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_test_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Add test customers
        customers_data = [
            {"device_ppp": "PPP-001", "full_name": "Ahmed Khan", "mobile_phone": "03001234567", "service_plan": "Premium 20Mbps", "address": "123 Main Street, Lahore"},
            {"device_ppp": "PPP-002", "full_name": "Sara Ali", "mobile_phone": "03009876543", "service_plan": "Basic 10Mbps", "address": "456 Park Road, Karachi"},
            {"device_ppp": "PPP-003", "full_name": "Bilal Ahmed", "mobile_phone": "03215551234", "service_plan": "Standard 15Mbps", "address": "789 Garden Town, Islamabad"},
        ]
        
        for data in customers_data:
            existing = db.query(Customer).filter(Customer.device_ppp == data["device_ppp"]).first()
            if not existing:
                db.add(Customer(**data))
                logger.info(f"Customer added: {data['full_name']}")
        
        db.commit()
        logger.info("Test customers seeded!")
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_data()
