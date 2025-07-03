-- Create admin user for testing
-- First insert into public.users table
INSERT INTO public.users (id, email, role, balance, is_banned) 
VALUES ('admin-test-user-id-12345', 'admin@admin.com', 'admin', 1000.00, false)
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  balance = 1000.00,
  is_banned = false;