# 🔐 KYC Verification Guide

> BVN verification integration with Dojah API for NairaRamp.

---

## Table of Contents

- [Overview](#overview)
- [Dojah Setup](#dojah-setup)
- [BVN Verification Flow](#bvn-verification-flow)
- [API Integration](#api-integration)
- [Webhook Handling](#webhook-handling)
- [Error Handling](#error-handling)
- [Compliance Considerations](#compliance-considerations)

---

## Overview

NairaRamp uses **Dojah** for BVN (Bank Verification Number) verification to comply with Nigerian financial regulations. KYC verification is required before users can convert crypto to Naira.

### KYC Tiers

| Tier | Requirements | Daily Limit | Monthly Limit |
|------|--------------|-------------|---------------|
| 0 | None (unverified) | $0 | $0 |
| 1 | BVN verified | $1,000 | $10,000 |
| 2 | BVN + Address | $5,000 | $50,000 |
| 3 | Full KYC | $10,000 | $100,000 |

---

## Dojah Setup

### 1. Create Dojah Account

1. Sign up at [app.dojah.io](https://app.dojah.io)
2. Complete business verification
3. Get API credentials from dashboard

### 2. Environment Variables

```env
DOJAH_APP_ID=your-dojah-app-id
DOJAH_API_KEY=your-dojah-api-key
DOJAH_WIDGET_ID=your-dojah-widget-id  # Optional for widget
```

### 3. API Base URLs

```typescript
// Production
const DOJAH_BASE_URL = 'https://api.dojah.io';

// Sandbox (for testing)
const DOJAH_SANDBOX_URL = 'https://sandbox.dojah.io';
```

---

## BVN Verification Flow

### User Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │────▶│  Verify     │────▶│  BVN Form   │────▶│  Pending    │
│  Prompt     │     │  Page       │     │  Submit     │     │  Review     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
       ┌───────────────────────────────────────────────────────────┘
       ▼
┌─────────────┐     ┌─────────────┐
│  Dojah API  │────▶│  Verified/  │
│  Response   │     │  Failed     │
└─────────────┘     └─────────────┘
```

### States

| Status | Description |
|--------|-------------|
| `not_started` | User hasn't initiated KYC |
| `pending` | BVN submitted, awaiting verification |
| `verified` | BVN successfully verified |
| `failed` | Verification failed (mismatch or invalid) |

---

## API Integration

### Dojah Client Setup

```typescript
// backend/lib/kyc/dojah.ts

interface DojahConfig {
  appId: string;
  apiKey: string;
  baseUrl: string;
}

class DojahClient {
  private config: DojahConfig;
  
  constructor() {
    this.config = {
      appId: process.env.DOJAH_APP_ID!,
      apiKey: process.env.DOJAH_API_KEY!,
      baseUrl: 'https://api.dojah.io',
    };
  }
  
  private getHeaders() {
    return {
      'Authorization': `${this.config.appId}`,
      'AppId': this.config.appId,
      'Content-Type': 'application/json',
    };
  }
  
  async verifyBVN(bvn: string, firstName: string, lastName: string, dob: string) {
    // Implementation below
  }
}

export const dojahClient = new DojahClient();
```

### BVN Lookup

```typescript
// backend/lib/kyc/dojah.ts

interface BVNLookupResponse {
  entity: {
    bvn: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    date_of_birth: string;
    phone_number1: string;
    phone_number2: string;
    enrollment_bank: string;
    enrollment_branch: string;
    email: string;
    gender: string;
    level_of_account: string;
    lga_of_origin: string;
    lga_of_residence: string;
    marital_status: string;
    nationality: string;
    residential_address: string;
    state_of_origin: string;
    state_of_residence: string;
    photo: string; // Base64 image
  };
}

async verifyBVN(
  bvn: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string
): Promise<{
  success: boolean;
  matched: boolean;
  data?: BVNLookupResponse['entity'];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${this.config.baseUrl}/api/v1/kyc/bvn?bvn=${bvn}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, matched: false, error: error.message };
    }
    
    const data: BVNLookupResponse = await response.json();
    const entity = data.entity;
    
    // Verify name and DOB match
    const firstNameMatch = entity.first_name.toLowerCase() === firstName.toLowerCase();
    const lastNameMatch = entity.last_name.toLowerCase() === lastName.toLowerCase();
    const dobMatch = entity.date_of_birth === dateOfBirth;
    
    const matched = firstNameMatch && lastNameMatch && dobMatch;
    
    return {
      success: true,
      matched,
      data: entity,
    };
  } catch (error) {
    return {
      success: false,
      matched: false,
      error: 'BVN verification service unavailable',
    };
  }
}
```

### API Route Implementation

```typescript
// backend/api/kyc/verify-bvn/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dojahClient } from '@/backend/lib/kyc/dojah';
import { createClient } from '@/backend/lib/supabase/server';

const bvnSchema = z.object({
  bvn: z.string().length(11).regex(/^\d+$/),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Parse and validate request
  const body = await request.json();
  const validation = bvnSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json({
      error: 'Invalid request',
      details: validation.error.errors,
    }, { status: 400 });
  }
  
  const { bvn, firstName, lastName, dateOfBirth } = validation.data;
  
  // Check if already verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('user_id', user.id)
    .single();
  
  if (profile?.kyc_status === 'verified') {
    return NextResponse.json({ error: 'Already verified' }, { status: 400 });
  }
  
  // Create KYC record
  const { data: kycRecord, error: kycError } = await supabase
    .from('kyc_records')
    .insert({
      user_id: user.id,
      bvn,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      status: 'pending',
    })
    .select()
    .single();
  
  if (kycError) {
    return NextResponse.json({ error: 'Failed to create KYC record' }, { status: 500 });
  }
  
  // Verify with Dojah
  const result = await dojahClient.verifyBVN(bvn, firstName, lastName, dateOfBirth);
  
  if (!result.success) {
    // Update KYC record as failed
    await supabase
      .from('kyc_records')
      .update({
        status: 'failed',
        failure_reason: result.error,
      })
      .eq('id', kycRecord.id);
    
    return NextResponse.json({
      success: false,
      error: result.error,
    }, { status: 400 });
  }
  
  if (!result.matched) {
    // Name/DOB mismatch
    await supabase
      .from('kyc_records')
      .update({
        status: 'failed',
        failure_reason: 'Name or date of birth does not match BVN records',
      })
      .eq('id', kycRecord.id);
    
    return NextResponse.json({
      success: false,
      error: 'Details do not match BVN records',
    }, { status: 400 });
  }
  
  // Success - update records
  await supabase
    .from('kyc_records')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verification_data: result.data,
    })
    .eq('id', kycRecord.id);
  
  await supabase
    .from('profiles')
    .update({
      kyc_status: 'verified',
      kyc_tier: 1,
      bvn_verified: true,
      full_name: `${result.data?.first_name} ${result.data?.last_name}`,
    })
    .eq('user_id', user.id);
  
  return NextResponse.json({
    success: true,
    message: 'BVN verified successfully',
  });
}
```

---

## Webhook Handling

For asynchronous verification (if using Dojah webhooks):

```typescript
// backend/api/webhooks/dojah/route.ts

export async function POST(request: Request) {
  // Verify webhook signature
  const signature = request.headers.get('x-dojah-signature');
  
  // Parse payload
  const payload = await request.json();
  
  // Handle verification result
  switch (payload.event) {
    case 'verification.success':
      // Update user KYC status
      break;
    case 'verification.failed':
      // Mark as failed
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

---

## Error Handling

### Common Errors

| Error Code | Description | User Message |
|------------|-------------|--------------|
| `INVALID_BVN` | BVN format invalid | "Please enter a valid 11-digit BVN" |
| `BVN_NOT_FOUND` | BVN doesn't exist | "BVN not found. Please verify and try again" |
| `NAME_MISMATCH` | Name doesn't match | "Name does not match BVN records" |
| `DOB_MISMATCH` | DOB doesn't match | "Date of birth does not match" |
| `SERVICE_UNAVAILABLE` | Dojah API down | "Verification service temporarily unavailable" |
| `RATE_LIMITED` | Too many attempts | "Please wait before trying again" |

### Retry Logic

```typescript
const MAX_DAILY_ATTEMPTS = 3;

async function checkRateLimit(userId: string): Promise<boolean> {
  // Check attempts in last 24 hours
  const { count } = await supabase
    .from('kyc_records')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  
  return (count || 0) < MAX_DAILY_ATTEMPTS;
}
```

---

## Compliance Considerations

### Data Storage

- Store BVN encrypted at rest
- Never log raw BVN values
- Implement data retention policies
- Comply with NDPR (Nigeria Data Protection Regulation)

### Security Measures

```typescript
// Example: Encrypt BVN before storage
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.BVN_ENCRYPTION_KEY!;
const IV_LENGTH = 16;

function encryptBVN(bvn: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(bvn);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptBVN(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

---

## Implementation Checklist

### Library Files
- [ ] `backend/lib/kyc/dojah.ts` — Dojah client

### API Routes
- [ ] `backend/api/kyc/verify-bvn/route.ts`
- [ ] `backend/api/kyc/status/route.ts`

### Frontend Components
- [ ] `frontend/components/kyc/BVNForm.tsx`
- [ ] `frontend/components/kyc/KYCStatus.tsx`
- [ ] `frontend/components/kyc/VerificationSteps.tsx`

### Testing
- [ ] Test with Dojah sandbox
- [ ] Test validation errors
- [ ] Test rate limiting
- [ ] Test edge cases (name variations, etc.)

---

## Resources

- [Dojah API Documentation](https://docs.dojah.io)
- [Dojah Dashboard](https://app.dojah.io)
- [NDPR Compliance Guide](https://nitda.gov.ng/nit/ndpr/)

---

<p align="center">
  <em>Handle user data with care. Comply with all applicable regulations.</em>
</p>
