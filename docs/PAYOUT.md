# 💸 Flutterwave Payout Guide

> NGN bank payout integration with Flutterwave for NairaRamp.

---

## Table of Contents

- [Overview](#overview)
- [Flutterwave Setup](#flutterwave-setup)
- [Bank List Integration](#bank-list-integration)
- [Transfer API](#transfer-api)
- [Webhook Handling](#webhook-handling)
- [Error Handling](#error-handling)
- [Reconciliation](#reconciliation)

---

## Overview

NairaRamp uses **Flutterwave** to send Nigerian Naira (NGN) to users' bank accounts after successful crypto conversion. The payout flow:

1. User converts USDC/USDT → NGN
2. Stellar payment confirmed
3. System initiates Flutterwave transfer
4. NGN arrives in user's bank account
5. Webhook confirms completion

---

## Flutterwave Setup

### 1. Create Flutterwave Account

1. Sign up at [dashboard.flutterwave.com](https://dashboard.flutterwave.com)
2. Complete business verification
3. Get API keys from Settings → API

### 2. Environment Variables

```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxx-X
FLUTTERWAVE_ENCRYPTION_KEY=xxxxxxxxxxxxxxxx

# Webhook secret for verifying callbacks
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret
```

### 3. API Base URL

```typescript
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
```

---

## Bank List Integration

### Fetch Nigerian Banks

```typescript
// backend/lib/flutterwave/banks.ts

interface Bank {
  id: number;
  code: string;
  name: string;
}

export async function getNigerianBanks(): Promise<Bank[]> {
  const response = await fetch(
    'https://api.flutterwave.com/v3/banks/NG',
    {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );
  
  const data = await response.json();
  
  if (data.status !== 'success') {
    throw new Error('Failed to fetch banks');
  }
  
  return data.data;
}
```

### Verify Account Number

```typescript
// backend/lib/flutterwave/banks.ts

interface AccountVerification {
  account_number: string;
  account_name: string;
}

export async function verifyAccountNumber(
  accountNumber: string,
  bankCode: string
): Promise<AccountVerification> {
  const response = await fetch(
    'https://api.flutterwave.com/v3/accounts/resolve',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode,
      }),
    }
  );
  
  const data = await response.json();
  
  if (data.status !== 'success') {
    throw new Error(data.message || 'Account verification failed');
  }
  
  return {
    account_number: data.data.account_number,
    account_name: data.data.account_name,
  };
}
```

### Cache Banks List

```typescript
// Cache banks in Redis for 24 hours
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCachedBanks(): Promise<Bank[]> {
  const cached = await redis.get<Bank[]>('nigerian-banks');
  
  if (cached) return cached;
  
  const banks = await getNigerianBanks();
  await redis.set('nigerian-banks', banks, { ex: 86400 }); // 24 hours
  
  return banks;
}
```

---

## Transfer API

### Initiate Transfer

```typescript
// backend/lib/flutterwave/payout.ts

interface TransferRequest {
  account_bank: string;      // Bank code
  account_number: string;
  amount: number;
  currency: string;          // NGN
  narration: string;
  reference: string;         // Unique reference
  callback_url?: string;
  debit_currency?: string;
}

interface TransferResponse {
  status: string;
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: string;
    currency: string;
    debit_currency: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta: any;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: number;
    bank_name: string;
  };
}

export async function initiateTransfer(
  request: TransferRequest
): Promise<TransferResponse> {
  const response = await fetch(
    'https://api.flutterwave.com/v3/transfers',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );
  
  const data: TransferResponse = await response.json();
  
  if (data.status !== 'success') {
    throw new Error(data.message || 'Transfer initiation failed');
  }
  
  return data;
}
```

### Get Transfer Status

```typescript
// backend/lib/flutterwave/payout.ts

export async function getTransferStatus(
  transferId: number
): Promise<TransferResponse['data']> {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transfers/${transferId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );
  
  const data = await response.json();
  
  if (data.status !== 'success') {
    throw new Error(data.message || 'Failed to get transfer status');
  }
  
  return data.data;
}
```

### Payout Service Integration

```typescript
// backend/services/PayoutService.ts

import { v4 as uuidv4 } from 'uuid';
import { initiateTransfer } from '@/backend/lib/flutterwave/payout';
import { createClient } from '@/backend/lib/supabase/server';

export class PayoutService {
  async initiatePayout(transactionId: string) {
    const supabase = createClient();
    
    // Get transaction details
    const { data: transaction } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles:user_id (
          bank_code,
          bank_name,
          account_number,
          account_name
        )
      `)
      .eq('id', transactionId)
      .single();
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // Generate unique reference
    const reference = `NR-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        transaction_id: transactionId,
        user_id: transaction.user_id,
        amount: transaction.output_amount,
        currency: 'NGN',
        bank_code: transaction.profiles.bank_code,
        bank_name: transaction.profiles.bank_name,
        account_number: transaction.profiles.account_number,
        account_name: transaction.profiles.account_name,
        status: 'pending',
      })
      .select()
      .single();
    
    if (payoutError) {
      throw new Error('Failed to create payout record');
    }
    
    // Initiate Flutterwave transfer
    try {
      const result = await initiateTransfer({
        account_bank: transaction.profiles.bank_code,
        account_number: transaction.profiles.account_number,
        amount: parseFloat(transaction.output_amount),
        currency: 'NGN',
        narration: `NairaRamp payout - ${reference}`,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/flutterwave`,
      });
      
      // Update payout with Flutterwave reference
      await supabase
        .from('payouts')
        .update({
          flutterwave_reference: reference,
          flutterwave_id: result.data.id,
          status: 'processing',
        })
        .eq('id', payout.id);
      
      // Update transaction status
      await supabase
        .from('transactions')
        .update({
          status: 'payout_processing',
          payout_id: payout.id,
        })
        .eq('id', transactionId);
      
      return { success: true, payoutId: payout.id };
      
    } catch (error) {
      // Update payout as failed
      await supabase
        .from('payouts')
        .update({
          status: 'failed',
          failure_reason: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', payout.id);
      
      throw error;
    }
  }
}
```

---

## Webhook Handling

### Flutterwave Webhook

```typescript
// backend/api/webhooks/flutterwave/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/backend/lib/supabase/server';

export async function POST(request: Request) {
  // Verify webhook signature
  const signature = request.headers.get('verif-hash');
  const expectedSignature = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  
  if (signature !== expectedSignature) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }
  
  const payload = await request.json();
  const supabase = createClient();
  
  // Handle transfer events
  if (payload.event === 'transfer.completed') {
    const { transfer } = payload.data;
    
    // Find payout by Flutterwave reference
    const { data: payout } = await supabase
      .from('payouts')
      .select('*, transactions(*)')
      .eq('flutterwave_reference', transfer.reference)
      .single();
    
    if (!payout) {
      console.error('Payout not found for reference:', transfer.reference);
      return NextResponse.json({ received: true });
    }
    
    if (transfer.status === 'SUCCESSFUL') {
      // Update payout as successful
      await supabase
        .from('payouts')
        .update({
          status: 'successful',
          completed_at: new Date().toISOString(),
        })
        .eq('id', payout.id);
      
      // Update transaction as completed
      await supabase
        .from('transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', payout.transaction_id);
      
      // TODO: Send success notification to user
      
    } else if (transfer.status === 'FAILED') {
      // Handle failure
      await supabase
        .from('payouts')
        .update({
          status: 'failed',
          failure_reason: transfer.complete_message,
        })
        .eq('id', payout.id);
      
      await supabase
        .from('transactions')
        .update({
          status: 'failed',
          failure_reason: `Payout failed: ${transfer.complete_message}`,
        })
        .eq('id', payout.transaction_id);
      
      // TODO: Trigger retry or refund process
    }
  }
  
  return NextResponse.json({ received: true });
}
```

### Webhook Security

```typescript
// Verify webhook is from Flutterwave
function verifyWebhook(signature: string | null, secret: string): boolean {
  if (!signature) return false;
  return signature === secret;
}
```

---

## Error Handling

### Common Errors

| Error Code | Description | Action |
|------------|-------------|--------|
| `INVALID_ACCOUNT` | Account doesn't exist | Re-verify account number |
| `INSUFFICIENT_BALANCE` | Flutterwave wallet low | Top up wallet |
| `TRANSFER_FAILED` | Bank rejected transfer | Retry or refund |
| `RATE_LIMIT` | Too many requests | Implement backoff |
| `BANK_UNAVAILABLE` | Bank network down | Queue for retry |

### Retry Logic

```typescript
// backend/lib/flutterwave/payout.ts

const MAX_RETRIES = 3;
const RETRY_DELAYS = [5000, 30000, 60000]; // 5s, 30s, 1min

export async function initiateTransferWithRetry(
  request: TransferRequest,
  retryCount = 0
): Promise<TransferResponse> {
  try {
    return await initiateTransfer(request);
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      throw error;
    }
    
    // Check if error is retryable
    const isRetryable = error instanceof Error && 
      (error.message.includes('BANK_UNAVAILABLE') || 
       error.message.includes('timeout'));
    
    if (!isRetryable) {
      throw error;
    }
    
    // Wait before retry
    await new Promise(resolve => 
      setTimeout(resolve, RETRY_DELAYS[retryCount])
    );
    
    return initiateTransferWithRetry(request, retryCount + 1);
  }
}
```

---

## Reconciliation

### Daily Reconciliation Job

```typescript
// scripts/reconcile-payouts.ts

import { createClient } from '@/backend/lib/supabase/server';
import { getTransferStatus } from '@/backend/lib/flutterwave/payout';

async function reconcilePayouts() {
  const supabase = createClient();
  
  // Get all processing payouts older than 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data: pendingPayouts } = await supabase
    .from('payouts')
    .select('*')
    .eq('status', 'processing')
    .lt('created_at', oneHourAgo.toISOString());
  
  for (const payout of pendingPayouts || []) {
    if (!payout.flutterwave_id) continue;
    
    try {
      const status = await getTransferStatus(payout.flutterwave_id);
      
      // Update based on Flutterwave status
      if (status.status === 'SUCCESSFUL') {
        await supabase
          .from('payouts')
          .update({ status: 'successful' })
          .eq('id', payout.id);
      } else if (status.status === 'FAILED') {
        await supabase
          .from('payouts')
          .update({ 
            status: 'failed',
            failure_reason: status.complete_message,
          })
          .eq('id', payout.id);
      }
    } catch (error) {
      console.error(`Failed to reconcile payout ${payout.id}:`, error);
    }
  }
}
```

---

## Implementation Checklist

### Library Files
- [ ] `backend/lib/flutterwave/banks.ts` — Bank list and verification
- [ ] `backend/lib/flutterwave/payout.ts` — Transfer functions

### Services
- [ ] `backend/services/PayoutService.ts` — Payout orchestration

### API Routes
- [ ] `backend/api/payout/initiate/route.ts`
- [ ] `backend/api/webhooks/flutterwave/route.ts`

### Testing
- [ ] Test with Flutterwave test mode
- [ ] Test webhook handling
- [ ] Test error scenarios
- [ ] Test reconciliation

---

## Resources

- [Flutterwave API Docs](https://developer.flutterwave.com/docs)
- [Flutterwave Dashboard](https://dashboard.flutterwave.com)
- [Transfer API Reference](https://developer.flutterwave.com/docs/transfers)

---

<p align="center">
  <em>Always test payouts in sandbox mode before going live!</em>
</p>
