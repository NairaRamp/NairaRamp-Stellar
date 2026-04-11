# ⚡ Realtime Features Guide

> Supabase Realtime, Stellar streaming, and caching for NairaRamp.

---

## Table of Contents

- [Overview](#overview)
- [Supabase Realtime](#supabase-realtime)
- [Stellar Payment Streaming](#stellar-payment-streaming)
- [Redis Caching](#redis-caching)
- [Polling vs Streaming](#polling-vs-streaming)
- [Implementation Patterns](#implementation-patterns)

---

## Overview

NairaRamp provides real-time updates for:

| Feature | Technology | Use Case |
|---------|------------|----------|
| Transaction status | Supabase Realtime | Dashboard updates |
| Payment detection | Stellar Horizon | Deposit confirmation |
| Exchange rates | Redis + Polling | Rate quotes |
| Notifications | Supabase Realtime | User alerts |

---

## Supabase Realtime

### Enable Realtime on Tables

```sql
-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Enable replica identity for UPDATE events
ALTER TABLE transactions REPLICA IDENTITY FULL;
```

### Client-Side Subscription

```typescript
// frontend/hooks/useTransactionUpdates.ts

import { useEffect } from 'react';
import { createClient } from '@/frontend/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useTransactionUpdates(userId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('transaction-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          
          // Or update cache directly
          queryClient.setQueryData(
            ['transaction', payload.new.id],
            payload.new
          );
          
          // Show notification for status changes
          if (payload.old.status !== payload.new.status) {
            showTransactionNotification(payload.new);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);
}
```

### Presence for Active Users

```typescript
// Track active users in conversion flow
const channel = supabase.channel('conversion-room');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Active users:', Object.keys(state).length);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

---

## Stellar Payment Streaming

### Horizon Streaming Client

```typescript
// backend/lib/stellar/monitor.ts

import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server(process.env.STELLAR_HORIZON_URL!);

export function createPaymentStream(
  accountId: string,
  onPayment: (payment: any) => Promise<void>
) {
  let closeStream: (() => void) | null = null;
  
  const startStream = () => {
    closeStream = server
      .payments()
      .forAccount(accountId)
      .cursor('now')
      .stream({
        onmessage: async (payment) => {
          if (payment.type === 'payment' && payment.to === accountId) {
            await onPayment(payment);
          }
        },
        onerror: (error) => {
          console.error('Stream error:', error);
          // Reconnect after delay
          setTimeout(startStream, 5000);
        },
      });
  };
  
  startStream();
  
  return () => {
    if (closeStream) closeStream();
  };
}
```

### Payment Processing

```typescript
// backend/lib/stellar/monitor.ts

import { createClient } from '@/backend/lib/supabase/server';

export async function handleIncomingPayment(payment: any) {
  const supabase = createClient();
  
  // Fetch transaction for memo
  const transaction = await payment.transaction();
  const memo = transaction.memo;
  
  if (!memo) {
    console.warn('Payment without memo, cannot identify user');
    return;
  }
  
  // Find pending transaction by memo
  const { data: pendingTx } = await supabase
    .from('transactions')
    .select('*')
    .eq('stellar_memo', memo)
    .eq('status', 'pending_deposit')
    .single();
  
  if (!pendingTx) {
    console.warn('No pending transaction for memo:', memo);
    return;
  }
  
  // Verify asset and amount
  const assetCode = payment.asset_code || 'XLM';
  const amount = parseFloat(payment.amount);
  
  if (assetCode !== pendingTx.input_asset) {
    console.error('Asset mismatch');
    // Handle wrong asset
    return;
  }
  
  if (amount < parseFloat(pendingTx.input_amount)) {
    console.error('Insufficient amount');
    // Handle partial payment
    return;
  }
  
  // Update transaction
  await supabase
    .from('transactions')
    .update({
      status: 'deposit_received',
      stellar_tx_hash: payment.transaction_hash,
      deposit_received_at: new Date().toISOString(),
    })
    .eq('id', pendingTx.id);
  
  // Supabase Realtime will notify the client
  
  // Continue to conversion
  await processConversion(pendingTx.id);
}
```

---

## Redis Caching

### Setup Upstash Redis

```typescript
// backend/lib/redis/client.ts

import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Cache Exchange Rates

```typescript
// backend/lib/rates/exchange.ts

import { redis } from '@/backend/lib/redis/client';

const RATE_CACHE_KEY = 'exchange:usd:ngn';
const RATE_TTL = 60; // 1 minute

interface ExchangeRate {
  rate: number;
  source: string;
  timestamp: string;
}

export async function getExchangeRate(): Promise<ExchangeRate> {
  // Check cache
  const cached = await redis.get<ExchangeRate>(RATE_CACHE_KEY);
  if (cached) return cached;
  
  // Fetch fresh rate
  const rate = await fetchRateFromSource();
  
  // Cache with TTL
  await redis.set(RATE_CACHE_KEY, rate, { ex: RATE_TTL });
  
  return rate;
}

async function fetchRateFromSource(): Promise<ExchangeRate> {
  // Example: fetch from exchange API
  const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=NGN');
  const data = await response.json();
  
  return {
    rate: data.rates.NGN,
    source: 'exchangerate.host',
    timestamp: new Date().toISOString(),
  };
}
```

### Cache Conversion Quotes

```typescript
// backend/lib/rates/quotes.ts

import { redis } from '@/backend/lib/redis/client';
import { v4 as uuidv4 } from 'uuid';

interface Quote {
  id: string;
  inputAmount: number;
  inputAsset: string;
  outputAmount: number;
  outputCurrency: string;
  rate: number;
  fee: number;
  expiresAt: string;
}

const QUOTE_TTL = 300; // 5 minutes

export async function createQuote(
  inputAmount: number,
  inputAsset: string
): Promise<Quote> {
  const rate = await getExchangeRate();
  const fee = inputAmount * 0.015; // 1.5% fee
  const netAmount = inputAmount - fee;
  const outputAmount = netAmount * rate.rate;
  
  const quote: Quote = {
    id: uuidv4(),
    inputAmount,
    inputAsset,
    outputAmount,
    outputCurrency: 'NGN',
    rate: rate.rate,
    fee,
    expiresAt: new Date(Date.now() + QUOTE_TTL * 1000).toISOString(),
  };
  
  // Store quote in Redis
  await redis.set(`quote:${quote.id}`, quote, { ex: QUOTE_TTL });
  
  return quote;
}

export async function getQuote(quoteId: string): Promise<Quote | null> {
  return redis.get<Quote>(`quote:${quoteId}`);
}
```

---

## Polling vs Streaming

### When to Use Each

| Approach | Use Case | Example |
|----------|----------|---------|
| **Streaming** | Always-on connection | Transaction status, chat |
| **Polling** | Periodic updates | Exchange rates |
| **Push** | Event-driven | Payment notifications |

### Polling with React Query

```typescript
// frontend/hooks/useExchangeRate.ts

import { useQuery } from '@tanstack/react-query';

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchange-rate'],
    queryFn: async () => {
      const response = await fetch('/api/conversion/quote?amount=1&asset=USDC');
      return response.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000,       // Consider stale after 10 seconds
  });
}
```

### Optimistic Updates

```typescript
// frontend/hooks/useCreateTransaction.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    
    // Optimistic update
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      
      const previousTransactions = queryClient.getQueryData(['transactions']);
      
      queryClient.setQueryData(['transactions'], (old: any[]) => [
        { ...newTransaction, status: 'pending_deposit' },
        ...old,
      ]);
      
      return { previousTransactions };
    },
    
    onError: (err, newTransaction, context) => {
      queryClient.setQueryData(
        ['transactions'],
        context?.previousTransactions
      );
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

---

## Implementation Patterns

### Transaction Status Updates

```typescript
// Combined approach: Supabase Realtime + React Query

export function TransactionStatus({ transactionId }: { transactionId: string }) {
  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => fetchTransaction(transactionId),
  });
  
  // Subscribe to real-time updates
  useTransactionUpdates(transactionId);
  
  return (
    <div>
      <StatusBadge status={transaction?.status} />
      {transaction?.status === 'pending_deposit' && (
        <DepositInstructions address={transaction.deposit_address} />
      )}
    </div>
  );
}
```

### Rate Ticker Component

```typescript
// frontend/components/app/RateDisplay.tsx

export function RateDisplay() {
  const { data: rate, isLoading } = useExchangeRate();
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted">1 USD =</span>
      {isLoading ? (
        <Skeleton className="w-20 h-6" />
      ) : (
        <span className="font-semibold">
          {formatCurrency(rate?.rate, 'NGN')}
        </span>
      )}
      <span className="text-xs text-muted">
        Updated {formatTimeAgo(rate?.timestamp)}
      </span>
    </div>
  );
}
```

---

## Implementation Checklist

### Supabase Realtime
- [ ] Enable realtime on transactions table
- [ ] Create `useTransactionUpdates` hook
- [ ] Handle connection errors and reconnection
- [ ] Clean up subscriptions on unmount

### Stellar Streaming
- [ ] Implement `createPaymentStream`
- [ ] Process incoming payments
- [ ] Handle stream errors
- [ ] Start stream on server startup

### Redis Caching
- [ ] Set up Upstash Redis client
- [ ] Cache exchange rates
- [ ] Cache conversion quotes
- [ ] Implement cache invalidation

### Polling
- [ ] Rate ticker with 30s polling
- [ ] Stale time configuration
- [ ] Error handling and retries

---

<p align="center">
  <em>Balance real-time updates with efficiency. Not everything needs to stream!</em>
</p>
