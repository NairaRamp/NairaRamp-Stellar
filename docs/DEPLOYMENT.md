# 🚀 Deployment Guide

> Production deployment guide for NairaRamp.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Domain & SSL](#domain--ssl)
- [Production Checklist](#production-checklist)
- [Monitoring & Alerts](#monitoring--alerts)
- [Backup & Recovery](#backup--recovery)

---

## Overview

NairaRamp is deployed as a serverless application:

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend + API | Vercel | Application hosting |
| Database | Supabase | PostgreSQL + Auth + Realtime |
| Cache | Upstash | Redis for rate limiting |
| Payments | Stellar | Blockchain network |
| Payouts | Flutterwave | NGN transfers |
| KYC | Dojah | BVN verification |

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with project code
- [ ] Vercel account (connected to GitHub)
- [ ] Supabase project created
- [ ] Upstash Redis database
- [ ] Stellar account (funded for production)
- [ ] Flutterwave account (verified business)
- [ ] Dojah account (verified business)
- [ ] Domain name (optional but recommended)

---

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project settings

### 2. Build Settings

```yaml
# Vercel automatically detects Next.js
Framework Preset: Next.js
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

### 3. Environment Variables

Add all environment variables in Vercel dashboard:
- Settings → Environment Variables
- Add each variable from `.env.example`

### 4. Deploy

```bash
# Using Vercel CLI
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```

### 5. Vercel Configuration

```typescript
// vercel.json (optional)
{
  "framework": "nextjs",
  "regions": ["iad1"], // Choose region closest to users
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" }
      ]
    }
  ]
}
```

---

## Supabase Setup

### 1. Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project
3. Choose region (Lagos or closest)
4. Save database password securely

### 2. Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

### 3. Configure Auth

In Supabase Dashboard → Authentication → Settings:

- Enable Email/Password
- Configure email templates
- Set redirect URLs:
  - `https://your-domain.com/auth/callback`
  - `http://localhost:3000/auth/callback` (development)

### 4. Enable Realtime

```sql
-- In Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
```

### 5. Get API Keys

From Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Environment Variables

### Complete List

```env
# ===========================================
# REQUIRED FOR PRODUCTION
# ===========================================

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Stellar (PRODUCTION)
STELLAR_NETWORK=PUBLIC
STELLAR_HORIZON_URL=https://horizon.stellar.org
STELLAR_MASTER_SECRET_KEY=S...your-production-secret-key

# Asset Issuers (Mainnet - verify these before mainnet!)
USDC_ASSET_ISSUER=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
USDT_ASSET_ISSUER=GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROEZ2HZKJ4VPVUUGPCLQHHB6

# Dojah (Production)
DOJAH_APP_ID=your-production-app-id
DOJAH_API_KEY=your-production-api-key

# Flutterwave (Production)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE-xxxxx
FLUTTERWAVE_ENCRYPTION_KEY=xxxxx
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://nairaramp.com
WEBHOOK_SECRET=your-32-char-secret

# ===========================================
# PRODUCTION SETTINGS
# ===========================================

# Limits (in USD)
MIN_CONVERSION_AMOUNT=10
MAX_CONVERSION_AMOUNT=10000
CONVERSION_FEE_PERCENT=1.5

# Feature flags
ENABLE_BVN_VERIFICATION=true
ENABLE_TESTNET_FAUCET=false
```

### Security Best Practices

- ✅ Never commit secrets to git
- ✅ Use Vercel Environment Variables UI
- ✅ Rotate keys periodically
- ✅ Use separate keys for staging/production
- ✅ Enable key scoping where available

---

## Domain & SSL

### 1. Add Custom Domain

In Vercel Dashboard:
1. Settings → Domains
2. Add your domain
3. Configure DNS records

### 2. DNS Configuration

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3. SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Production Checklist

### Before Launch

- [ ] **Security**
  - [ ] All secrets in environment variables
  - [ ] CORS configured correctly
  - [ ] Rate limiting enabled
  - [ ] Webhook signatures verified
  - [ ] RLS policies tested

- [ ] **Stellar**
  - [ ] Using mainnet (not testnet)
  - [ ] Production keypair (not testnet keys)
  - [ ] Account funded with XLM
  - [ ] Trustlines created for USDC/USDT
  - [ ] Verified correct asset issuers

- [ ] **Flutterwave**
  - [ ] Using live API keys
  - [ ] Webhook URL configured
  - [ ] Test payout successful
  - [ ] Webhook signature verification

- [ ] **Dojah**
  - [ ] Using production API keys
  - [ ] BVN verification tested
  - [ ] Error handling in place

- [ ] **Database**
  - [ ] Migrations applied
  - [ ] RLS policies enabled
  - [ ] Backups configured
  - [ ] Indexes created

- [ ] **Monitoring**
  - [ ] Error tracking set up
  - [ ] Uptime monitoring
  - [ ] Performance monitoring
  - [ ] Alert channels configured

### Post-Launch

- [ ] Monitor error rates
- [ ] Check transaction success rate
- [ ] Review conversion metrics
- [ ] Monitor Stellar account balance
- [ ] Review Flutterwave wallet balance
- [ ] Check rate limiting effectiveness

---

## Monitoring & Alerts

### Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Uptime Monitoring

Configure uptime checks for:
- `https://nairaramp.com` (landing page)
- `https://nairaramp.com/api/health` (API health)
- Supabase status
- Flutterwave webhook endpoint

### Alerts

Set up alerts for:
- Error rate > 1%
- P95 latency > 2s
- Stellar account balance < 100 XLM
- Flutterwave balance < ₦1,000,000
- Failed payout rate > 5%

### Health Check Endpoint

```typescript
// backend/api/health/route.ts

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    stellar: await checkStellar(),
    redis: await checkRedis(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  return Response.json(
    { status: healthy ? 'healthy' : 'unhealthy', checks },
    { status: healthy ? 200 : 503 }
  );
}
```

---

## Backup & Recovery

### Database Backups

Supabase provides automatic daily backups (Pro plan).

For additional safety:
```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Disaster Recovery

1. **Database corruption**
   - Restore from Supabase point-in-time recovery
   - Re-run migrations if needed

2. **Stellar key compromise**
   - Generate new keypair immediately
   - Move funds to new account
   - Update environment variables
   - Update deposit addresses

3. **API key compromise**
   - Rotate all keys immediately
   - Review access logs
   - Update environment variables

---

## Scaling Considerations

### Traffic Scaling

Vercel Edge Functions auto-scale. For high traffic:
- Enable Vercel Edge caching
- Use Upstash for rate limiting
- Consider regional deployments

### Database Scaling

Supabase scaling options:
- Upgrade to Pro plan for connection pooling
- Enable read replicas for heavy read loads
- Use Edge Functions for latency-sensitive operations

---

## Deployment Commands

```bash
# Deploy to production
vercel --prod

# Preview deployment
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Rollback to previous deployment
vercel rollback

# Environment variables
vercel env pull
vercel env add
```

---

## Implementation Checklist

- [ ] Set up Vercel project
- [ ] Configure Supabase project
- [ ] Add all environment variables
- [ ] Run database migrations
- [ ] Configure webhooks
- [ ] Set up custom domain
- [ ] Enable monitoring
- [ ] Configure alerts
- [ ] Complete security review
- [ ] Test all flows in production

---

<p align="center">
  <em>Test thoroughly in a staging environment before going live!</em>
</p>
