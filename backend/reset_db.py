#!/usr/bin/env python3
"""
Script to reset database - drops all tables and recreates them
Run this from the backend directory: python reset_db.py
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def reset_db():
    """Drop all tables and recreate them"""
    try:
        print("🔌 Connecting to database...")
        from app.database import engine, Base
        from app.models.user import User
        from app.models.booking import Booking
        from app.models.review import Review
        
        # Test connection
        with engine.connect() as conn:
            print("✓ Connection successful")
        
        # Drop all tables
        print("🗑️  Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        print("✓ Tables dropped")
        
        # Recreate all tables based on models
        print("📦 Creating new tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ New tables created successfully!")
        print("\n✅ Database reset complete!")
        print("   - users table (UUID)")
        print("   - bookings table (UUID)")
        print("   - reviews table (UUID)")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        print(f"\n❌ Database reset failed!")
        print("Make sure:")
        print("  1. PostgreSQL is running")
        print("  2. Database 'maidease_db' exists")
        print("  3. User 'maidease_user' exists")
        print("  4. .env file has correct DATABASE_URL")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = reset_db()
    sys.exit(0 if success else 1)
