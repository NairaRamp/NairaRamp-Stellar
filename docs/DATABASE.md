# 🗃️ Database Schema Documentation

> Supabase PostgreSQL schema, migrations, and RLS policies for NairaRamp.

---

## Table of Contents

- [Overview](#overview)
- [Tables](#tables)
- [Migrations](#migrations)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Realtime Subscriptions](#realtime-subscriptions)
- [Indexes](#indexes)
- [Seed Data](#seed-data)

---

## Overview

NairaRamp uses **Supabase** (PostgreSQL) as the primary database with:
- **Row Level Security (RLS)** for data access control
- **Realtime** subscriptions for live updates
- **Database migrations** for version control

---

## Tables

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │────<│   wallets    │     │ kyc_records  │
│              │     │              │     │              │
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ user_id (FK) │     │ user_id (FK) │     │ user_id (FK) │
│ bvn_verified │     │ address      │     │ bvn          │
│ bank_details │     │ asset        │     │ status       │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌──────────────────────────────────────┐
│            transactions              │
│                                      │
│ id (PK)                              │
│ user_id (FK)                         │
│ wallet_id (FK)                       │
│ status                               │
│ input_amount / output_amount         │
└──────────────────────────────────────┘
                    │
                    ▼
┌──────────────┐     ┌──────────────┐
│   payouts    │     │exchange_rates│
│              │     │              │
│ id (PK)      │     │ id (PK)      │
│ txn_id (FK)  │     │ rate         │
│ status       │     │ timestamp    │
└──────────────┘     └──────────────┘
```

---

## Table Schemas

### profiles

User profile information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  
  -- KYC Status
  kyc_status TEXT DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'verified', 'failed')),
  kyc_tier INTEGER DEFAULT 0 CHECK (kyc_tier >= 0 AND kyc_tier <= 3),
  bvn_verified BOOLEAN DEFAULT FALSE,
  
  -- Bank Details (encrypted in production)
  bank_code TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  
  -- Limits
  daily_limit DECIMAL(15, 2) DEFAULT 10000.00,
  monthly_limit DECIMAL(15, 2) DEFAULT 100000.00,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### wallets

Stellar deposit addresses generated for users.

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Stellar address details
  public_key TEXT NOT NULL,
  memo TEXT NOT NULL UNIQUE,
  
  -- Asset type
  asset TEXT NOT NULL CHECK (asset IN ('USDC', 'USDT')),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  
  -- Associated transaction (if used)
  transaction_id UUID,
  
  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);
```

---

### transactions

Conversion transaction records.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES wallets(id),
  
  -- Transaction type and status
  type TEXT DEFAULT 'conversion' CHECK (type IN ('conversion', 'refund')),
  status TEXT DEFAULT 'pending_deposit' CHECK (
    status IN (
      'pending_deposit',    -- Waiting for Stellar deposit
      'deposit_received',   -- Deposit confirmed on Stellar
      'converting',         -- Processing conversion
      'payout_pending',     -- Initiating bank payout
      'payout_processing',  -- Payout in progress
      'completed',          -- Successfully completed
      'failed',             -- Transaction failed
      'refunded',           -- Refund issued
      'expired'             -- Deposit window expired
    )
  ),
  
  -- Input (Crypto)
  input_asset TEXT NOT NULL CHECK (input_asset IN ('USDC', 'USDT')),
  input_amount DECIMAL(15, 6) NOT NULL,
  
  -- Output (NGN)
  output_currency TEXT DEFAULT 'NGN',
  output_amount DECIMAL(15, 2) NOT NULL,
  
  -- Exchange rate at time of transaction
  exchange_rate DECIMAL(15, 4) NOT NULL,
  
  -- Fees
  fee_amount DECIMAL(15, 2) NOT NULL,
  fee_percent DECIMAL(5, 2) NOT NULL,
  
  -- Stellar transaction details
  stellar_tx_hash TEXT,
  stellar_memo TEXT,
  deposit_address TEXT,
  
  -- Payout details
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
```

---

### kyc_records

BVN verification attempts and results.

```sql
CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- BVN details (encrypted in production)
  bvn TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  
  -- Verification status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  
  -- External API reference
  dojah_reference_id TEXT,
  
  -- Verification results
  match_score DECIMAL(5, 2),
  verification_data JSONB,
  failure_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
```

---

### exchange_rates

Cached NGN/USD exchange rates.

```sql
CREATE TABLE exchange_rates (
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
```

---

### payouts

Flutterwave payout records.

```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Payout details
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
```

---

## Migrations

### Migration Files

Place in `supabase/migrations/`:

```
supabase/
└── migrations/
    ├── 001_users.sql           # profiles table
    ├── 002_transactions.sql    # transactions table
    ├── 003_kyc.sql             # kyc_records table
    ├── 004_wallets.sql         # wallets table
    └── 005_rates.sql           # exchange_rates & payouts
```

### Running Migrations

```bash
# Push migrations to Supabase
pnpm db:migrate

# Reset database (development only)
pnpm db:reset

# Seed database
pnpm db:seed
```

---

## Row Level Security (RLS)

### Enable RLS on All Tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
```

### Profiles Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create profile on signup (via trigger)
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Transactions Policies

```sql
-- Users can view own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create transactions
CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can update transactions
CREATE POLICY "Service role can update transactions"
  ON transactions FOR UPDATE
  USING (auth.role() = 'service_role');
```

### Wallets Policies

```sql
-- Users can view own wallets
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);
```

### KYC Records Policies

```sql
-- Users can view own KYC records
CREATE POLICY "Users can view own KYC records"
  ON kyc_records FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create KYC records
CREATE POLICY "Users can create KYC records"
  ON kyc_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Exchange Rates Policies

```sql
-- Everyone can read exchange rates
CREATE POLICY "Public can view exchange rates"
  ON exchange_rates FOR SELECT
  TO authenticated
  USING (true);
```

---

## Realtime Subscriptions

### Enable Realtime

```sql
-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Enable realtime for specific columns only (optional)
ALTER TABLE transactions REPLICA IDENTITY FULL;
```

### Client Subscription

```typescript
// Subscribe to transaction updates
const subscription = supabase
  .channel('transactions')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'transactions',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // Handle real-time update
      console.log('Transaction updated:', payload.new);
    }
  )
  .subscribe();
```

---

## Indexes

### Performance Indexes

```sql
-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);

-- Transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Wallets
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_memo ON wallets(memo);
CREATE INDEX idx_wallets_status ON wallets(status);

-- Payouts
CREATE INDEX idx_payouts_transaction_id ON payouts(transaction_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Exchange Rates
CREATE INDEX idx_exchange_rates_valid ON exchange_rates(valid_from, valid_until);
```

---

## Seed Data

### Development Seed

```sql
-- supabase/seed.sql

-- Insert test exchange rate
INSERT INTO exchange_rates (base_currency, quote_currency, rate, source, valid_from)
VALUES ('USD', 'NGN', 1550.00, 'manual', NOW());

-- Note: User profiles are created automatically via auth trigger
-- Test users can be created via Supabase Auth UI or API
```

---

## Database Functions & Triggers

### Auto-create Profile on Signup

```sql
-- Function to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Update Timestamps

```sql
-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Implementation Checklist

- [ ] Create all migration files
- [ ] Enable RLS on all tables
- [ ] Create RLS policies
- [ ] Add performance indexes
- [ ] Create database functions
- [ ] Set up triggers
- [ ] Enable Realtime
- [ ] Create seed data
- [ ] Test migrations locally
- [ ] Document any schema changes

---

<p align="center">
  <em>See BACKEND.md for API integration and REALTIME.md for subscription setup.</em>
</p>
