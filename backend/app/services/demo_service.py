"""
Demo Account Service for MaidEase.
Provides demo login functionality for recruiters and potential users
to explore the platform without creating personal accounts.
"""
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class DemoService:
    """Service for managing demo accounts."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def ensure_demo_accounts_exist(self) -> dict:
        """
        Ensure demo accounts exist in the database.
        Creates them if they don't exist.
        Returns dict with account status.
        """
        results = {"customer": False, "maid": False}
        
        # Demo Customer Account
        customer = self.db.query(User).filter(
            User.email == settings.DEMO_CUSTOMER_EMAIL
        ).first()
        
        if not customer:
            logger.info(f"Creating demo customer account: {settings.DEMO_CUSTOMER_EMAIL}")
            customer = User(
                email=settings.DEMO_CUSTOMER_EMAIL,
                hashed_password=get_password_hash(settings.DEMO_PASSWORD),
                full_name="Demo Customer",
                phone_number="+1-555-DEMO-001",
                role=UserRole.CUSTOMER,
                is_active=True,
            )
            self.db.add(customer)
            results["customer"] = True
        
        # Demo Maid Account
        maid = self.db.query(User).filter(
            User.email == settings.DEMO_MAID_EMAIL
        ).first()
        
        if not maid:
            logger.info(f"Creating demo maid account: {settings.DEMO_MAID_EMAIL}")
            maid = User(
                email=settings.DEMO_MAID_EMAIL,
                hashed_password=get_password_hash(settings.DEMO_PASSWORD),
                full_name="Demo Service Provider",
                phone_number="+1-555-DEMO-002",
                role=UserRole.MAID,
                is_active=True,
                bio="Demo account for exploring MaidEase platform features. This is a sample service provider profile.",
                skills="House Cleaning, Deep Cleaning, Organization, Laundry",
                experience_years=3,
                hourly_rate=25.00,
                average_rating=4.5,
            )
            self.db.add(maid)
            results["maid"] = True
        
        if results["customer"] or results["maid"]:
            self.db.commit()
            logger.info("Demo accounts created/verified successfully")
        
        return results
    
    def get_demo_credentials(self) -> dict:
        """
        Get demo account credentials for display.
        Only returns credentials if demo mode is enabled.
        """
        if not settings.DEMO_ENABLED:
            return {"enabled": False}
        
        return {
            "enabled": True,
            "customer": {
                "email": settings.DEMO_CUSTOMER_EMAIL,
                "password": settings.DEMO_PASSWORD,
                "role": "customer",
                "description": "Explore as a customer - browse maids, make bookings, leave reviews"
            },
            "maid": {
                "email": settings.DEMO_MAID_EMAIL,
                "password": settings.DEMO_PASSWORD,
                "role": "maid",
                "description": "Explore as a service provider - manage bookings, view earnings"
            }
        }
    
    def is_demo_account(self, email: str) -> bool:
        """Check if an email belongs to a demo account."""
        return email in [settings.DEMO_CUSTOMER_EMAIL, settings.DEMO_MAID_EMAIL]
    
    def reset_demo_account(self, email: str) -> bool:
        """
        Reset a demo account to its default state.
        Useful for cleaning up after demo sessions.
        """
        if not self.is_demo_account(email):
            return False
        
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return False
        
        # Reset password to default
        user.hashed_password = get_password_hash(settings.DEMO_PASSWORD)
        user.is_active = True
        
        # Reset profile fields for maid demo account
        if user.role == UserRole.MAID:
            user.bio = "Demo account for exploring MaidEase platform features."
            user.skills = "House Cleaning, Deep Cleaning, Organization, Laundry"
            user.experience_years = 3
            user.hourly_rate = 25.00
        
        self.db.commit()
        logger.info(f"Demo account reset: {email}")
        return True
