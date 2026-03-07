-- VoilaPCR initial database schema
-- Run against Supabase PostgreSQL when project is configured.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- users — core user table, linked to auth provider
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id       TEXT UNIQUE NOT NULL,          -- Clerk/Supabase auth user ID
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  tier          TEXT NOT NULL DEFAULT 'free'    -- 'free' | 'pro' | 'lab'
                CHECK (tier IN ('free', 'pro', 'lab')),
  stripe_customer_id TEXT UNIQUE,
  lab_id        UUID REFERENCES labs(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE,
  referred_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- ============================================================
-- labs — lab/team accounts for Lab tier
-- ============================================================
CREATE TABLE labs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  owner_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  max_members           INT NOT NULL DEFAULT 20,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_labs_owner ON labs(owner_id);

-- ============================================================
-- usage — monthly usage tracking per user
-- ============================================================
CREATE TABLE usage (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month             TEXT NOT NULL,             -- 'YYYY-MM' format
  analysis_count    INT NOT NULL DEFAULT 0,
  drqpcr_query_count INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, month)
);

CREATE INDEX idx_usage_user_month ON usage(user_id, month);

-- ============================================================
-- format_requests — user requests for new instrument support
-- ============================================================
CREATE TABLE format_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL,
  instrument_name TEXT NOT NULL,
  file_url        TEXT,                        -- Optional uploaded sample file URL
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'reviewing', 'implemented', 'declined')),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_format_requests_status ON format_requests(status);

-- ============================================================
-- referrals — tracks referral invitations and conversions
-- ============================================================
CREATE TABLE referrals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_email   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'sent'
                  CHECK (status IN ('sent', 'signed_up', 'converted')),
  stripe_coupon_id TEXT,                       -- Coupon applied if converted
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_email ON referrals(referee_email);

-- ============================================================
-- Row Level Security (RLS) policies
-- Enable RLS on all tables; policies to be defined per-table.
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE format_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own row
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = auth_id);

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON usage FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));

-- Users can view their own referrals
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (referrer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));

-- Anyone can insert format requests (public form)
CREATE POLICY "Anyone can submit format requests"
  ON format_requests FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- Updated-at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER labs_updated_at
  BEFORE UPDATE ON labs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER usage_updated_at
  BEFORE UPDATE ON usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER format_requests_updated_at
  BEFORE UPDATE ON format_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
