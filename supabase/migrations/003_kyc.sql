-- ===========================================
-- 003_kyc.sql - KYC Records Table
-- ===========================================

CREATE TABLE IF NOT EXISTS kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- BVN details (encrypt in production)
  bvn TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  
  -- Verification status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  
  -- External reference
  dojah_reference_id TEXT,
  
  -- Results
  match_score DECIMAL(5, 2),
  verification_data JSONB,
  failure_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_records_user_id ON kyc_records(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_records_status ON kyc_records(status);

-- Enable RLS
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own KYC records"
  ON kyc_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create KYC records"
  ON kyc_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update KYC records"
  ON kyc_records FOR UPDATE
  USING (auth.role() = 'service_role');
