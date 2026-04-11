-- ===========================================
-- 002_transactions.sql - Transactions Table
-- ===========================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID,  -- Added after wallets table
  
  -- Transaction type and status
  type TEXT DEFAULT 'conversion' CHECK (type IN ('conversion', 'refund')),
  status TEXT DEFAULT 'pending_deposit' CHECK (
    status IN (
      'pending_deposit',
      'deposit_received',
      'converting',
      'payout_pending',
      'payout_processing',
      'completed',
      'failed',
      'refunded',
      'expired'
    )
  ),
  
  -- Input (Crypto)
  input_asset TEXT NOT NULL CHECK (input_asset IN ('USDC', 'USDT')),
  input_amount DECIMAL(15, 6) NOT NULL,
  
  -- Output (NGN)
  output_currency TEXT DEFAULT 'NGN',
  output_amount DECIMAL(15, 2) NOT NULL,
  
  -- Exchange rate
  exchange_rate DECIMAL(15, 4) NOT NULL,
  
  -- Fees
  fee_amount DECIMAL(15, 2) NOT NULL,
  fee_percent DECIMAL(5, 2) NOT NULL,
  
  -- Stellar details
  stellar_tx_hash TEXT,
  stellar_memo TEXT,
  deposit_address TEXT,
  
  -- Payout
  payout_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deposit_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Notes
  failure_reason TEXT,
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_stellar_memo ON transactions(stellar_memo);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update (for backend processing)
CREATE POLICY "Service role can update transactions"
  ON transactions FOR UPDATE
  USING (auth.role() = 'service_role');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Updated at trigger
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
