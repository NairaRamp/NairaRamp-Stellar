# ⭐ Stellar Integration Guide

> Stellar blockchain integration for NairaRamp deposit and payment monitoring.

---

## Table of Contents

- [Overview](#overview)
- [Testnet Setup](#testnet-setup)
- [Asset Configuration](#asset-configuration)
- [Address Generation](#address-generation)
- [Trustlines](#trustlines)
- [Payment Monitoring](#payment-monitoring)
- [Memo-Based Identification](#memo-based-identification)
- [Error Handling](#error-handling)
- [Mainnet Migration](#mainnet-migration)

---

## Overview

NairaRamp uses the **Stellar blockchain** for receiving USDC and USDT deposits. The integration includes:

- **Deposit address generation** with unique memos
- **Real-time payment monitoring** via Horizon API
- **Trustline management** for stablecoin assets
- **Transaction verification** before payout

### Why Stellar?

| Feature | Benefit |
|---------|---------|
| Fast finality | ~5 second transactions |
| Low fees | <$0.01 per transaction |
| Stablecoin support | Native USDC/USDT |
| Horizon API | Easy integration |
| Testnet | Free development |

---

## Testnet Setup

### 1. Get Stellar SDK

```bash
pnpm add @stellar/stellar-sdk
```

### 2. Environment Variables

```env
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_MASTER_SECRET_KEY=your-master-secret-key
```

### 3. Generate Master Keypair (One-time)

```typescript
import { Keypair } from '@stellar/stellar-sdk';

// Generate new keypair (save these securely!)
const masterKeypair = Keypair.random();
console.log('Public Key:', masterKeypair.publicKey());
console.log('Secret Key:', masterKeypair.secret());

// Fund on testnet: https://laboratory.stellar.org/#account-creator?network=test
```

### 4. Fund Testnet Account

Visit [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) and:
1. Enter your public key
2. Click "Get test network lumens"
3. Verify account funded on [Horizon](https://horizon-testnet.stellar.org/accounts/{PUBLIC_KEY})

---

## Asset Configuration

### Testnet Asset Issuers

```env
# USDC Testnet (Circle test issuer)
USDC_ASSET_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5

# USDT Testnet
USDT_ASSET_ISSUER=GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROEZ2HZKJ4VPVUUGPCLQHHB6
```

### Asset Definitions

```typescript
// backend/lib/stellar/assets.ts

import { Asset } from '@stellar/stellar-sdk';

export const USDC = new Asset(
  'USDC',
  process.env.USDC_ASSET_ISSUER!
);

export const USDT = new Asset(
  'USDT',
  process.env.USDT_ASSET_ISSUER!
);

export const SUPPORTED_ASSETS = {
  USDC,
  USDT,
} as const;
```

### Mainnet Asset Issuers

```env
# USDC Mainnet (Circle official)
USDC_ASSET_ISSUER=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN

# USDT Mainnet
USDT_ASSET_ISSUER=GCQTGZQQ5G4PTM2GL7CDIFKUBIPEC52BROEZ2HZKJ4VPVUUGPCLQHHB6
```

---

## Address Generation

### Strategy: Single Address + Memo

We use a **single deposit address** with unique **memos** to identify users:

```
[Master Account] + [Unique Memo per Transaction]
```

### Generate Unique Memo

```typescript
// backend/lib/stellar/wallet.ts

import { v4 as uuidv4 } from 'uuid';

export function generateDepositMemo(): string {
  // Generate unique memo (max 28 chars for Stellar)
  const uuid = uuidv4().replace(/-/g, '').substring(0, 28);
  return uuid;
}

export interface DepositAddress {
  address: string;     // Master public key
  memo: string;        // Unique memo for this transaction
  memoType: 'text';
  asset: 'USDC' | 'USDT';
  expiresAt: Date;
}

export function createDepositAddress(asset: 'USDC' | 'USDT'): DepositAddress {
  const memo = generateDepositMemo();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min expiry
  
  return {
    address: process.env.STELLAR_MASTER_PUBLIC_KEY!,
    memo,
    memoType: 'text',
    asset,
    expiresAt,
  };
}
```

---

## Trustlines

Before receiving assets, the master account needs trustlines.

### Create Trustline

```typescript
// backend/lib/stellar/wallet.ts

import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
} from '@stellar/stellar-sdk';

const server = new Horizon.Server(process.env.STELLAR_HORIZON_URL!);

export async function createTrustline(asset: Asset): Promise<string> {
  const masterKeypair = Keypair.fromSecret(process.env.STELLAR_MASTER_SECRET_KEY!);
  const account = await server.loadAccount(masterKeypair.publicKey());
  
  const transaction = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: asset,
        limit: '922337203685.4775807', // Max limit
      })
    )
    .setTimeout(30)
    .build();
  
  transaction.sign(masterKeypair);
  
  const result = await server.submitTransaction(transaction);
  return result.hash;
}
```

### Check Trustline Exists

```typescript
export async function hasTrustline(asset: Asset): Promise<boolean> {
  const publicKey = Keypair.fromSecret(process.env.STELLAR_MASTER_SECRET_KEY!).publicKey();
  
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances.some(
      (balance) =>
        balance.asset_type !== 'native' &&
        balance.asset_code === asset.code &&
        balance.asset_issuer === asset.issuer
    );
  } catch {
    return false;
  }
}
```

---

## Payment Monitoring

### Horizon Streaming

```typescript
// backend/lib/stellar/monitor.ts

import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server(process.env.STELLAR_HORIZON_URL!);

export interface IncomingPayment {
  id: string;
  from: string;
  amount: string;
  asset: string;
  assetIssuer: string;
  memo: string;
  memoType: string;
  createdAt: string;
  transactionHash: string;
}

export function streamPayments(
  accountId: string,
  onPayment: (payment: IncomingPayment) => void
) {
  // Get cursor for last seen payment
  const cursor = 'now';
  
  return server
    .payments()
    .forAccount(accountId)
    .cursor(cursor)
    .stream({
      onmessage: async (record: any) => {
        // Only process payment operations
        if (record.type !== 'payment') return;
        
        // Only process incoming payments
        if (record.to !== accountId) return;
        
        // Fetch transaction for memo
        const transaction = await record.transaction();
        
        const payment: IncomingPayment = {
          id: record.id,
          from: record.from,
          amount: record.amount,
          asset: record.asset_code || 'XLM',
          assetIssuer: record.asset_issuer || '',
          memo: transaction.memo || '',
          memoType: transaction.memo_type || '',
          createdAt: record.created_at,
          transactionHash: record.transaction_hash,
        };
        
        onPayment(payment);
      },
      onerror: (error: Error) => {
        console.error('Streaming error:', error);
        // Implement reconnection logic
      },
    });
}
```

### Process Incoming Payment

```typescript
// backend/lib/stellar/monitor.ts

export async function processIncomingPayment(payment: IncomingPayment) {
  // 1. Verify memo matches pending transaction
  const pendingTx = await db.transactions.findOne({
    where: {
      stellar_memo: payment.memo,
      status: 'pending_deposit',
    },
  });
  
  if (!pendingTx) {
    console.warn('Unknown memo, may be refund needed:', payment.memo);
    return;
  }
  
  // 2. Verify amount and asset match
  if (payment.asset !== pendingTx.input_asset) {
    throw new Error('Asset mismatch');
  }
  
  if (parseFloat(payment.amount) < parseFloat(pendingTx.input_amount)) {
    throw new Error('Insufficient amount');
  }
  
  // 3. Update transaction status
  await db.transactions.update(pendingTx.id, {
    status: 'deposit_received',
    stellar_tx_hash: payment.transactionHash,
    deposit_received_at: new Date(),
  });
  
  // 4. Trigger conversion process
  await conversionService.processDeposit(pendingTx.id);
}
```

---

## Memo-Based Identification

### Why Memos?

- **Single address** simplifies monitoring
- **Unique memo** = unique transaction
- **Text memos** up to 28 characters

### Memo Format

```
Format: [UUID without dashes, 28 chars max]
Example: 550e8400e29b41d4a716446655
```

### Validation

```typescript
function isValidMemo(memo: string): boolean {
  // Must be alphanumeric, max 28 chars
  return /^[a-zA-Z0-9]{1,28}$/.test(memo);
}
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ACCOUNT_NOT_FOUND` | Account doesn't exist | Create and fund account |
| `NO_TRUST` | Missing trustline | Create trustline first |
| `UNDERFUNDED` | Insufficient XLM | Fund with XLM for fees |
| `TIMEOUT` | Network congestion | Retry with higher fee |

### Error Handler

```typescript
export async function handleStellarError(error: any) {
  const extras = error?.response?.data?.extras;
  
  if (extras?.result_codes?.operations) {
    const opCodes = extras.result_codes.operations;
    
    if (opCodes.includes('op_no_trust')) {
      throw new Error('Missing trustline for asset');
    }
    
    if (opCodes.includes('op_underfunded')) {
      throw new Error('Insufficient balance');
    }
  }
  
  throw error;
}
```

---

## Mainnet Migration

### Checklist

1. **Update network configuration**
   ```env
   STELLAR_NETWORK=PUBLIC
   STELLAR_HORIZON_URL=https://horizon.stellar.org
   ```

2. **Generate new production keypair**
   - Never reuse testnet keys!

3. **Update asset issuers**
   - Use official USDC/USDT issuers

4. **Fund account with real XLM**
   - Purchase from exchange

5. **Create production trustlines**

6. **Test with small amounts first**

7. **Set up monitoring and alerts**

---

## Implementation Checklist

### Library Files (`backend/lib/stellar/`)
- [ ] `client.ts` — Horizon server setup
- [ ] `wallet.ts` — Keypair and address generation
- [ ] `monitor.ts` — Payment streaming
- [ ] `assets.ts` — Asset definitions

### API Routes
- [ ] `generate-address/route.ts`
- [ ] `check-payment/route.ts`
- [ ] `webhook/route.ts`

### Testing
- [ ] Test trustline creation
- [ ] Test address generation
- [ ] Test payment streaming
- [ ] Test with testnet USDC

---

## Resources

- [Stellar Documentation](https://developers.stellar.org/docs)
- [Horizon API Reference](https://developers.stellar.org/api/horizon)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar SDK for JavaScript](https://stellar.github.io/js-stellar-sdk/)

---

<p align="center">
  <em>Test thoroughly on Testnet before mainnet deployment!</em>
</p>
