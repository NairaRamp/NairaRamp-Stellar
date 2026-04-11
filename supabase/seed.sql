-- ===========================================
-- seed.sql - Development Seed Data
-- ===========================================
-- Use for local development only

-- Insert test exchange rate
INSERT INTO exchange_rates (base_currency, quote_currency, rate, source, valid_from)
VALUES ('USD', 'NGN', 1550.00, 'manual', NOW())
ON CONFLICT DO NOTHING;

-- Note: User profiles are created automatically via auth trigger
-- Create test users via Supabase Auth UI or API

-- Example: After creating a test user, you can add bank details
-- UPDATE profiles 
-- SET 
--   bank_code = '057',
--   bank_name = 'Zenith Bank',
--   account_number = '1234567890',
--   account_name = 'Test User'
-- WHERE email = 'test@example.com';
