# MaidEase Database Setup Guide

This folder contains SQL scripts to initialize and seed the MaidEase PostgreSQL database on Supabase.

## Files

- **init.sql** - Database schema creation (tables, enums, indexes, triggers)
- **seed.sql** - Sample data for testing
- **README.md** - This file

## Database Schema

### Tables

1. **users** - User accounts (customers and maids)
   - Fields: id, email, full_name, phone_number, role, bio, skills, hourly_rate, etc.
   - Types: UUID primary key, ENUM for role (customer/maid)
   - Indexes: email, role for fast lookups

2. **bookings** - Booking transactions
   - Fields: id, customer_id, maid_id, service_type, booking_date, status, total_amount, notes
   - Status: pending, accepted, completed, canceled
   - Foreign keys: References users table for both customer and maid

3. **reviews** - Customer reviews for services
   - Fields: id, booking_id, customer_id, maid_id, rating (1-5), comment
   - Unique constraint on booking_id (one review per booking)
   - Foreign keys: References bookings and users tables

## Setup Instructions

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Create new project
5. Wait for database initialization (3-5 minutes)

### Step 2: Access SQL Editor
1. In Supabase dashboard, go to **SQL Editor** on the left sidebar
2. Click **New Query**

### Step 3: Run init.sql
1. Copy entire contents of `init.sql`
2. Paste in the SQL Editor query window
3. Click **Run** (or Ctrl+Enter)
4. Wait for completion - you should see success message

### Step 4: Run seed.sql
1. Click **New Query** again
2. Copy entire contents of `seed.sql`
3. Paste in the SQL Editor query window
4. Click **Run**
5. You should see "Users created: 7", "Bookings created: 3", "Reviews created: 1"

### Step 5: Verify Tables
1. Go to **Table Editor** on the left sidebar
2. You should see tables:
   - users
   - bookings
   - reviews
3. Click each table to verify data was inserted

## Environment Variables for Backend

After setting up Supabase, get your connection string:

1. Go to **Settings** → **Database**
2. Copy **Connection string** (URI format)
3. Add to your backend `.env`:

```env
DATABASE_URL=postgresql://postgres.[PROJECT_ID]:YOUR_PASSWORD@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Replace:
- `[PROJECT_ID]` with your Supabase project ID
- `YOUR_PASSWORD` with your database password
- `[REGION]` with your region (us-east-1, eu-west-1, etc.)

## Sample Data

The seed.sql includes:

**Users (7 total):**
- 3 test customers
- 4 test maids with different skills and rates

**Bookings (3 total):**
- Pending booking
- Accepted booking
- Completed booking

**Reviews (1 total):**
- 5-star review for completed booking

## Login Credentials for Testing

All test users have password: `password`

**Customers:**
- customer1@example.com
- customer2@example.com
- customer3@example.com

**Maids:**
- maid1@example.com (Maria Garcia - $25/hr, 4.8⭐)
- maid2@example.com (Sofia Martinez - $30/hr, 4.9⭐)
- maid3@example.com (Rosa Hernandez - $22/hr, 4.7⭐)
- maid4@example.com (Angela Lopez - $20/hr, 4.6⭐)

## Troubleshooting

### Error: "relation already exists"
- This means the table was already created
- You can safely ignore this error or DROP tables first:
  ```sql
  DROP TABLE IF EXISTS reviews CASCADE;
  DROP TABLE IF EXISTS bookings CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  DROP TYPE IF EXISTS booking_status;
  DROP TYPE IF EXISTS user_role;
  ```

### Error: "permission denied"
- Make sure you're using the correct database credentials
- Verify your Supabase project is active

### Tables not appearing
- Refresh the Table Editor page
- Or query directly:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```

## Features Included

✅ UUID primary keys (better than auto-increment)
✅ Automatic timestamps (created_at, updated_at)
✅ Foreign key constraints with CASCADE delete
✅ Enum types for role and status
✅ Indexes for common queries (email, role, status)
✅ Automatic trigger to update updated_at timestamp
✅ Check constraints (rating must be 1-5)
✅ Unique constraints (one review per booking)

## Next Steps

1. Run init.sql in Supabase
2. Run seed.sql in Supabase
3. Get CONNECTION_STRING from Supabase Settings
4. Update backend `.env` with DATABASE_URL
5. Test backend API with sample data
6. Deploy backend to Render
7. Deploy frontend to Vercel

## Related Documentation

- Supabase: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs
- SQLAlchemy: https://docs.sqlalchemy.org
