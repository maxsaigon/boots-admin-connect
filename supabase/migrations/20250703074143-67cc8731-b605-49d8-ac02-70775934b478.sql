-- Create admin user using proper UUID and auth.users integration
-- This will create the auth user and the corresponding profile

-- Insert admin user directly (this should be done via admin API, but for demo purposes)
-- Using a proper UUID format
INSERT INTO public.users (id, email, role, balance, is_banned) 
VALUES ('550e8400-e29b-41d4-a716-446655440010', 'admin@admin.com', 'admin', 1000.00, false)
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  balance = 1000.00,
  is_banned = false;