-- Run this SQL in your Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  subscription_active BOOLEAN NOT NULL DEFAULT false,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  pack TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  type TEXT NOT NULL DEFAULT 'one_time',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story TEXT NOT NULL,
  genre TEXT,
  mood TEXT,
  tempo TEXT,
  vocals_mode TEXT,
  title TEXT,
  lyrics TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RPC: add_credits
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users SET credits = credits + p_credits, updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: deduct_credit
CREATE OR REPLACE FUNCTION deduct_credit(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users SET credits = GREATEST(credits - 1, 0), updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: refund_credit
CREATE OR REPLACE FUNCTION refund_credit(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users SET credits = credits + 1, updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- User blends table (Genre Blender saved combos)
CREATE TABLE IF NOT EXISTS user_blends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  genre TEXT,
  mood TEXT,
  instruments TEXT[],
  production TEXT,
  blend_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_user_blends_user_id ON user_blends(user_id);
