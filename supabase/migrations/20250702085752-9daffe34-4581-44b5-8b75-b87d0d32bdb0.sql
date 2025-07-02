-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  balance NUMERIC NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_1000 NUMERIC NOT NULL,
  tag TEXT,
  category TEXT,
  description TEXT,
  estimated_process_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES public.services(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  url TEXT NOT NULL,
  notes TEXT,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR ALL USING (public.get_my_role() = 'admin');

-- RLS Policies for services
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (public.get_my_role() = 'admin');

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.get_my_role() = 'admin');

-- Insert demo data
-- Demo users (these will be created when users sign up through auth)
INSERT INTO public.users (id, email, role, balance, is_banned) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'user@demo.com', 'user', 100.00, false),
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@demo.com', 'admin', 500.00, false);

-- Demo services
INSERT INTO public.services (name, price_per_1000, tag, category, description, estimated_process_time) VALUES
  ('Instagram Followers', 2.50, 'followers', 'Instagram', 'High quality Instagram followers for your account', '1-3 hours'),
  ('YouTube Views', 1.20, 'views', 'YouTube', 'Real YouTube views to boost your video performance', '12-24 hours'),
  ('TikTok Likes', 1.80, 'likes', 'TikTok', 'Increase engagement with TikTok likes', '1-6 hours'),
  ('Twitter Followers', 3.00, 'followers', 'Twitter', 'Grow your Twitter following organically', '2-4 hours'),
  ('Instagram Likes', 0.80, 'likes', 'Instagram', 'Boost your Instagram posts with real likes', '30 minutes'),
  ('Facebook Page Likes', 2.20, 'likes', 'Facebook', 'Increase your Facebook page popularity', '6-12 hours'),
  ('YouTube Subscribers', 4.50, 'subscribers', 'YouTube', 'Grow your YouTube channel subscriber base', '24-48 hours'),
  ('TikTok Followers', 2.80, 'followers', 'TikTok', 'Build your TikTok audience quickly', '2-6 hours');

-- Demo orders
INSERT INTO public.orders (user_id, service_id, quantity, url, notes, total, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 1, 1000, 'https://instagram.com/demo_account', 'Please deliver gradually', 2.50, 'processing'),
  ('550e8400-e29b-41d4-a716-446655440000', 2, 2000, 'https://youtube.com/watch?v=demo123', 'High retention views preferred', 2.40, 'completed'),
  ('550e8400-e29b-41d4-a716-446655440000', 3, 500, 'https://tiktok.com/@demo_user', NULL, 0.90, 'pending_review');