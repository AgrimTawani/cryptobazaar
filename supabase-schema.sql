-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tokens table
CREATE TABLE public.tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  contract_address TEXT UNIQUE NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  chain_id INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User balances table
CREATE TABLE public.user_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE,
  balance DECIMAL(36,18) NOT NULL DEFAULT 0,
  frozen_balance DECIMAL(36,18) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, token_id)
);

-- Transaction ads table
CREATE TABLE public.transaction_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE,
  amount DECIMAL(36,18) NOT NULL,
  price_per_token DECIMAL(18,8) NOT NULL, -- Price in INR
  total_price DECIMAL(18,2) NOT NULL, -- Total price in INR
  payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'crypto')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  min_amount DECIMAL(36,18),
  max_amount DECIMAL(36,18),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Escrow transactions table
CREATE TABLE public.escrow_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES public.transaction_ads(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE,
  amount DECIMAL(36,18) NOT NULL,
  price_per_token DECIMAL(18,8) NOT NULL,
  total_price DECIMAL(18,2) NOT NULL,
  payment_method TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  channel_id TEXT, -- Yellow network channel ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'locked', 'completed', 'cancelled', 'disputed')),
  buyer_confirmed BOOLEAN DEFAULT false,
  seller_confirmed BOOLEAN DEFAULT false,
  dispute_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transaction logs table
CREATE TABLE public.transaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  details JSONB,
  performed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tokens: Everyone can read active tokens
CREATE POLICY "Active tokens are viewable by everyone" ON public.tokens
  FOR SELECT USING (is_active = true);

-- User balances: Users can only see their own balances
CREATE POLICY "Users can view own balances" ON public.user_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own balances" ON public.user_balances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balances" ON public.user_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transaction ads: Everyone can read active ads
CREATE POLICY "Active ads are viewable by everyone" ON public.transaction_ads
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create their own ads" ON public.transaction_ads
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own ads" ON public.transaction_ads
  FOR UPDATE USING (auth.uid() = seller_id);

-- Escrow transactions: Involved parties can see their transactions
CREATE POLICY "Users can view their own transactions" ON public.escrow_transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions for ads they own" ON public.escrow_transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Involved parties can update transactions" ON public.escrow_transactions
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Transaction logs: Involved parties can see logs for their transactions
CREATE POLICY "Users can view logs for their transactions" ON public.transaction_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.escrow_transactions et
      WHERE et.id = transaction_logs.transaction_id
      AND (et.buyer_id = auth.uid() OR et.seller_id = auth.uid())
    )
  );

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_balances
  BEFORE UPDATE ON public.user_balances
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_transaction_ads
  BEFORE UPDATE ON public.transaction_ads
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_escrow_transactions
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some default tokens
INSERT INTO public.tokens (name, symbol, contract_address, decimals, chain_id) VALUES
('Ethereum', 'ETH', '0x0000000000000000000000000000000000000000', 18, 1),
('USD Coin', 'USDC', '0xA0b86a33E6441e88C5F2712C3E9b74Ec6f6e44b9', 6, 1),
('Tether', 'USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 1);
