# Supabase Configuration

This directory contains database migrations and configuration.

See [docs/DATABASE.md](../docs/DATABASE.md) for schema documentation.

## Structure

```
supabase/
├── migrations/           # SQL migration files
│   ├── 001_users.sql     # User profiles table
│   ├── 002_transactions.sql
│   ├── 003_kyc.sql
│   ├── 004_wallets.sql
│   └── 005_rates.sql
├── seed.sql              # Development seed data
└── config.toml           # Local Supabase config
```

## Commands

```bash
# Link to Supabase project
supabase link --project-ref your-project-id

# Push migrations
supabase db push

# Reset database (development)
supabase db reset

# Generate types
supabase gen types typescript --local > types/supabase.ts
```
