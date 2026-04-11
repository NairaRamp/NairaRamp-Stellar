-- ===========================================
-- 005_rates.sql - Exchange Rates & Payouts
-- ===========================================

-- Exchange Rates Table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Currency pair
  base_currency TEXT NOT NULL DEFAULT 'USD',
  quote_currency TEXT NOT NULL DEFAULT 'NGN',
  
  -- Rate
  rate DECIMAL(15, 4) NOT NULL,
  
  -- Source
  source TEXT NOT NULL DEFAULT 'manual',
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_valid 
ON exchange_rates(valid_from, valid_until);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Everyone can read rates
CREATE POLICY "Authenticated users can view rates"
  ON exchange_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage rates"
  ON exchange_rates FOR ALL
  USING (auth.role() = 'service_role');


-- Payouts Table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Amount
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  
  -- Bank details
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  
  -- Flutterwave reference
  flutterwave_reference TEXT,
  flutterwave_id INTEGER,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'successful', 'failed', 'reversed')
  ),
  
  -- Failure handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_transaction_id ON payouts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_flutterwave_ref ON payouts(flutterwave_reference);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payouts"
  ON payouts FOR ALL
  USING (auth.role() = 'service_role');

-- Update trigger
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add payout FK to transactions
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_payout 
FOREIGN KEY (payout_id) REFERENCES payouts(id);
