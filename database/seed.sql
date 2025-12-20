-- MaidEase Database Seed Data
-- Insert sample data for testing

-- Insert test customers
INSERT INTO users (email, hashed_password, full_name, phone_number, role, is_active)
VALUES 
    (
        'customer1@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJha', -- password: password
        'John Doe',
        '+1234567890',
        'customer',
        true
    ),
    (
        'customer2@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJha',
        'Jane Smith',
        '+1987654321',
        'customer',
        true
    ),
    (
        'customer3@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJha',
        'Robert Wilson',
        '+1555666777',
        'customer',
        true
    )
ON CONFLICT (email) DO NOTHING;

-- Insert test maids
INSERT INTO users (email, hashed_password, full_name, phone_number, role, is_active, bio, skills, experience_years, hourly_rate, average_rating)
VALUES 
    (
        'maid1@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJha',
        'Maria Garcia',
        '+1234567891',
        'maid',
        true,
        'Professional cleaning specialist with 5+ years of experience',
        'Deep cleaning, Laundry, Organization',
        5,
        25.00,
        4.8
    ),
    (
        'maid2@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJha',
        'Sofia Martinez',
        '+1234567892',
        'maid',
        true,
        'Expert in residential and commercial cleaning',
        'House cleaning, Window cleaning, Carpet cleaning',
        7,
        30.00,
        4.9
    ),
    (
        'maid3@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJha',
        'Rosa Hernandez',
        '+1234567893',
        'maid',
        true,
        'Specialized in eco-friendly cleaning solutions',
        'Green cleaning, Kitchen deep clean, Bathroom detail',
        4,
        22.00,
        4.7
    ),
    (
        'maid4@example.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJha',
        'Angela Lopez',
        '+1234567894',
        'maid',
        true,
        'Quick and efficient with great attention to detail',
        'Regular cleaning, Laundry service, Ironing',
        3,
        20.00,
        4.6
    )
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for creating bookings and reviews
-- Note: In a real scenario, you would query these IDs
-- For seed data, we'll use placeholder UUIDs or insert bookings separately

-- Insert sample bookings (adjust customer_id and maid_id as needed)
-- This is a template - actual UUIDs should match your users
INSERT INTO bookings (customer_id, maid_id, service_type, booking_date, time_slot, status, total_amount, notes)
SELECT 
    c.id,
    m.id,
    'House Cleaning',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    '10:00 AM - 2:00 PM',
    'pending',
    100.00,
    'Need full house cleaning including kitchen and bathrooms'
FROM users c, users m
WHERE c.email = 'customer1@example.com' AND m.email = 'maid1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO bookings (customer_id, maid_id, service_type, booking_date, time_slot, status, total_amount, notes)
SELECT 
    c.id,
    m.id,
    'Deep Cleaning',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    '1:00 PM - 5:00 PM',
    'accepted',
    150.00,
    'Deep clean with carpet shampooing'
FROM users c, users m
WHERE c.email = 'customer2@example.com' AND m.email = 'maid2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO bookings (customer_id, maid_id, service_type, booking_date, time_slot, status, total_amount, notes)
SELECT 
    c.id,
    m.id,
    'Eco-Friendly Cleaning',
    CURRENT_TIMESTAMP + INTERVAL '1 days',
    '9:00 AM - 12:00 PM',
    'completed',
    88.00,
    'Green cleaning products requested'
FROM users c, users m
WHERE c.email = 'customer3@example.com' AND m.email = 'maid3@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample reviews (for completed bookings)
INSERT INTO reviews (booking_id, customer_id, maid_id, rating, comment)
SELECT 
    b.id,
    b.customer_id,
    b.maid_id,
    5,
    'Excellent service! Very professional and thorough. Will book again.'
FROM bookings b
WHERE b.status = 'completed' AND b.customer_id = (SELECT id FROM users WHERE email = 'customer3@example.com' LIMIT 1)
LIMIT 1
ON CONFLICT DO NOTHING;

-- Display summary of inserted data
SELECT 'Users created' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Bookings created', COUNT(*) FROM bookings
UNION ALL
SELECT 'Reviews created', COUNT(*) FROM reviews;
