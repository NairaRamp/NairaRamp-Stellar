# ⚙️ Backend API Documentation

> API routes and server-side logic for NairaRamp.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Request/Response Formats](#requestresponse-formats)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhook Handlers](#webhook-handlers)
- [Service Layer](#service-layer)

---

## Overview

The backend uses Next.js API Routes (App Router) with serverless functions. All routes are located in `backend/api/` and follow RESTful conventions.

Key responsibilities:
- Stellar address generation and payment monitoring
- Conversion quote calculation and execution
- KYC verification via Dojah
- Bank payouts via Flutterwave
- Webhook handling for external services

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Serverless endpoints |
| Stellar SDK | Blockchain operations |
| Supabase | Database & auth |
| Dojah API | BVN verification |
| Flutterwave API | Bank payouts |
| Upstash Redis | Rate limiting |
| Svix | Webhook verification |

---

## API Endpoints

### Stellar Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/stellar/generate-address` | Generate unique deposit address |
| `GET` | `/api/stellar/check-payment` | Check for incoming payment |
| `POST` | `/api/stellar/webhook` | Handle Stellar payment events |

### Conversion

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversion/quote` | Get conversion quote |
| `POST` | `/api/conversion/execute` | Execute conversion |

### Payout

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payout/initiate` | Initiate NGN bank payout |

### KYC

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/kyc/verify-bvn` | Submit BVN for verification |
| `GET` | `/api/kyc/status` | Get KYC verification status |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/flutterwave` | Flutterwave payout webhook |
| `POST` | `/api/webhooks/stellar` | Stellar payment webhook |

---

## Request/Response Formats

### POST /api/stellar/generate-address

Generate a unique Stellar deposit address for the user.

**Request:**
```json
{
  "userId": "uuid",
  "asset": "USDC" | "USDT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "memo": "unique-memo-id",
    "asset": "USDC",
    "expiresAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/stellar/check-payment

Check if payment has been received.

**Query Parameters:**
- `transactionId` (string) — Transaction ID to check

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending" | "received" | "confirmed" | "failed",
    "amount": "100.00",
    "asset": "USDC",
    "stellarTxHash": "abc123...",
    "receivedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/conversion/quote

Get a conversion quote for USDC/USDT to NGN.

**Query Parameters:**
- `amount` (number) — Amount in stablecoin
- `asset` (string) — "USDC" or "USDT"

**Response:**
```json
{
  "success": true,
  "data": {
    "inputAmount": "100.00",
    "inputAsset": "USDC",
    "outputAmount": "150000.00",
    "outputCurrency": "NGN",
    "exchangeRate": "1500.00",
    "fee": "1.50",
    "feePercent": "1.5",
    "expiresAt": "2024-01-01T00:05:00Z"
  }
}
```

---

### POST /api/conversion/execute

Execute a conversion after user confirms.

**Request:**
```json
{
  "quoteId": "quote-uuid",
  "userId": "user-uuid",
  "bankAccountId": "bank-account-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-uuid",
    "status": "pending_deposit",
    "depositAddress": "GXXXXXXX...",
    "depositMemo": "memo-123",
    "inputAmount": "100.00",
    "outputAmount": "150000.00"
  }
}
```

---

### POST /api/payout/initiate

Initiate NGN bank payout (internal, called after conversion).

**Request:**
```json
{
  "transactionId": "txn-uuid",
  "amount": "150000.00",
  "bankCode": "057",
  "accountNumber": "1234567890",
  "accountName": "John Doe",
  "narration": "NairaRamp payout"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payoutId": "payout-uuid",
    "flutterwaveRef": "FLW-123456",
    "status": "pending",
    "amount": "150000.00"
  }
}
```

---

### POST /api/kyc/verify-bvn

Submit BVN for verification.

**Request:**
```json
{
  "bvn": "12345678901",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verificationId": "ver-uuid",
    "status": "pending" | "verified" | "failed",
    "message": "BVN verification successful"
  }
}
```

---

### GET /api/kyc/status

Get current KYC status for user.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "not_started" | "pending" | "verified" | "failed",
    "verifiedAt": "2024-01-01T00:00:00Z",
    "tier": 1 | 2 | 3,
    "limits": {
      "daily": "10000.00",
      "monthly": "100000.00"
    }
  }
}
```

---

## Authentication

All protected endpoints require Supabase authentication.

### Authentication Flow

```typescript
// backend/lib/supabase/server.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

### Protected Route Pattern

```typescript
// Example route handler

import { NextResponse } from 'next/server';
import { createClient } from '@/backend/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Continue with authenticated user...
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid BVN format",
    "details": {
      "field": "bvn",
      "constraint": "Must be 11 digits"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid auth |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `STELLAR_ERROR` | 502 | Stellar network error |
| `EXTERNAL_API_ERROR` | 502 | External API failure |

---

## Rate Limiting

Using Upstash Redis for rate limiting.

### Configuration

```typescript
// backend/lib/utils/rateLimit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/conversion/quote` | 30 | 1 minute |
| `/api/conversion/execute` | 5 | 1 minute |
| `/api/kyc/verify-bvn` | 3 | 1 hour |
| `/api/payout/initiate` | 10 | 1 minute |

---

## Webhook Handlers

### Flutterwave Webhook

```typescript
// backend/api/webhooks/flutterwave/route.ts

export async function POST(request: Request) {
  // 1. Verify signature
  const signature = request.headers.get('verif-hash');
  const expectedSignature = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  
  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // 2. Parse payload
  const payload = await request.json();
  
  // 3. Handle event
  switch (payload.event) {
    case 'transfer.completed':
      // Update payout status
      break;
    case 'transfer.failed':
      // Handle failure, trigger refund
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

### Stellar Webhook (via streaming)

```typescript
// backend/lib/stellar/monitor.ts

// Implement Horizon streaming for real-time payment detection
// See STELLAR.md for detailed implementation
```

---

## Service Layer

### Service Pattern

```typescript
// backend/services/ConversionService.ts

export class ConversionService {
  async getQuote(amount: number, asset: 'USDC' | 'USDT') {
    // 1. Get current exchange rate
    // 2. Calculate fees
    // 3. Return quote with expiration
  }
  
  async executeConversion(quoteId: string, userId: string) {
    // 1. Validate quote
    // 2. Generate deposit address
    // 3. Create transaction record
    // 4. Start payment monitoring
  }
  
  async processPayment(stellarTxHash: string) {
    // 1. Verify payment on Stellar
    // 2. Update transaction status
    // 3. Initiate payout
  }
}
```

---

## Implementation Checklist

### Stellar Routes
- [ ] `generate-address/route.ts` — Address generation
- [ ] `check-payment/route.ts` — Payment status check
- [ ] `webhook/route.ts` — Stellar events

### Conversion Routes
- [ ] `quote/route.ts` — Quote calculation
- [ ] `execute/route.ts` — Execute conversion

### KYC Routes
- [ ] `verify-bvn/route.ts` — BVN submission
- [ ] `status/route.ts` — Status check

### Payout Routes
- [ ] `initiate/route.ts` — Initiate payout

### Webhook Routes
- [ ] `flutterwave/route.ts` — Flutterwave webhooks
- [ ] `stellar/route.ts` — Stellar webhooks

### Services
- [ ] `ConversionService.ts`
- [ ] `PayoutService.ts`
- [ ] `KYCService.ts`
- [ ] `StellarService.ts`

---

<p align="center">
  <em>See DATABASE.md for schema details and STELLAR.md for blockchain integration.</em>
</p>
