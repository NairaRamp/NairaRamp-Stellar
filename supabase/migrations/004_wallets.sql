-- ===========================================
-- 004_wallets.sql - Stellar Wallets Table
-- ===========================================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Stellar address
  public_key TEXT NOT NULL,
  memo TEXT NOT NULL UNIQUE,
  
  -- Asset type
  asset TEXT NOT NULL CHECK (asset IN ('USDC', 'USDT')),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  
  -- Linked transaction
  transaction_id UUID REFERENCES transactions(id),
  
  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_memo ON wallets(memo);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON wallets(status);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage wallets"
  ON wallets FOR ALL
  USING (auth.role() = 'service_role');

-- Add foreign key to transactions
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_wallet 
FOREIGN KEY (wallet_id) REFERENCES wallets(id);
