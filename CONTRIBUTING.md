# 🤝 Contributing to NairaRamp

Thank you for your interest in contributing to NairaRamp! This guide will help you get started with contributing to the project.

---

## 📖 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Code Patterns & Standards](#code-patterns--standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn and grow

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+
- pnpm (recommended) or npm
- Git
- Supabase account (for database)

### First-Time Setup

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/naira-ramp.git
cd naira-ramp

# Add upstream remote
git remote add upstream https://github.com/nairaramp/naira-ramp.git

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

---

## 🛠️ Development Setup

### Environment Variables

```bash
# Required for local development
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (optional)
supabase start

# Or connect to cloud project
supabase link --project-ref your-project-id
supabase db push
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
pnpm test         # Run tests
pnpm db:migrate   # Run database migrations
```

---

## 🏗️ Project Architecture

```
naira-ramp/
├── frontend/          # React/Next.js frontend
├── backend/           # API routes and services
├── supabase/          # Database migrations
└── docs/              # Documentation
```

### Key Directories

| Directory | Purpose | Owner |
|-----------|---------|-------|
| `frontend/app/` | Next.js pages | Frontend team |
| `frontend/components/` | React components | Frontend team |
| `backend/api/` | API endpoints | Backend team |
| `backend/lib/` | Server utilities | Backend team |
| `backend/services/` | Business logic | Backend team |
| `supabase/migrations/` | Database schema | Backend team |

---

## 📐 Code Patterns & Standards

### TypeScript

**Always use TypeScript.** No `any` types unless absolutely necessary.

```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  email: string;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad - Implicit any
function getUser(id) {
  // ...
}
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ConversionWidget.tsx` |
| Hooks | camelCase + use prefix | `useConversionRate.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | camelCase | `transaction.ts` |
| API Routes | route.ts in folder | `api/kyc/verify-bvn/route.ts` |
| Constants | SCREAMING_SNAKE | `constants.ts` → `MAX_AMOUNT` |

### React Components

```typescript
// ✅ Good - Functional component with proper typing
// frontend/components/app/WalletCard.tsx

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';

interface WalletCardProps {
  balance: number;
  currency: 'USDC' | 'USDT';
  isLoading?: boolean;
}

export const WalletCard: FC<WalletCardProps> = ({ 
  balance, 
  currency, 
  isLoading = false 
}) => {
  if (isLoading) {
    return <WalletCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currency} Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {formatCurrency(balance, currency)}
        </p>
      </CardContent>
    </Card>
  );
};

// Named export, not default
```

### Custom Hooks

```typescript
// ✅ Good - Custom hook pattern
// frontend/hooks/useConversionRate.ts

import { useQuery } from '@tanstack/react-query';

interface ConversionRate {
  rate: number;
  source: string;
  updatedAt: string;
}

export function useConversionRate() {
  return useQuery<ConversionRate>({
    queryKey: ['conversion-rate'],
    queryFn: async () => {
      const response = await fetch('/api/conversion/quote?amount=1&asset=USDC');
      if (!response.ok) throw new Error('Failed to fetch rate');
      return response.json();
    },
    refetchInterval: 30_000, // 30 seconds
    staleTime: 10_000,       // 10 seconds
  });
}

// Usage in component:
// const { data: rate, isLoading, error } = useConversionRate();
```

### API Routes

```typescript
// ✅ Good - API route pattern
// backend/api/kyc/status/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/backend/lib/supabase/server';
import { z } from 'zod';

// Response type
interface KYCStatusResponse {
  success: boolean;
  data?: {
    status: string;
    tier: number;
  };
  error?: string;
}

export async function GET(): Promise<NextResponse<KYCStatusResponse>> {
  try {
    // 1. Auth check
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Fetch data
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('kyc_status, kyc_tier')
      .eq('user_id', user.id)
      .single();

    if (dbError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch KYC status' },
        { status: 500 }
      );
    }

    // 3. Return response
    return NextResponse.json({
      success: true,
      data: {
        status: profile.kyc_status,
        tier: profile.kyc_tier,
      },
    });

  } catch (error) {
    console.error('KYC status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Service Layer

```typescript
// ✅ Good - Service class pattern
// backend/services/ConversionService.ts

import { createClient } from '@/backend/lib/supabase/server';
import { getExchangeRate } from '@/backend/lib/rates/exchange';

interface ConversionQuote {
  id: string;
  inputAmount: number;
  outputAmount: number;
  rate: number;
  fee: number;
  expiresAt: Date;
}

interface CreateQuoteParams {
  amount: number;
  asset: 'USDC' | 'USDT';
  userId: string;
}

export class ConversionService {
  private supabase = createClient();

  async createQuote(params: CreateQuoteParams): Promise<ConversionQuote> {
    const { amount, asset, userId } = params;
    
    // Validate
    if (amount < 10) {
      throw new Error('Minimum amount is 10 USD');
    }

    // Get rate
    const rate = await getExchangeRate();
    
    // Calculate
    const feePercent = 0.015; // 1.5%
    const fee = amount * feePercent;
    const netAmount = amount - fee;
    const outputAmount = netAmount * rate.rate;

    // Store quote
    const quote: ConversionQuote = {
      id: crypto.randomUUID(),
      inputAmount: amount,
      outputAmount,
      rate: rate.rate,
      fee,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    };

    // Cache in Redis...
    
    return quote;
  }

  async executeConversion(quoteId: string, userId: string) {
    // Implementation...
  }
}

// Export singleton instance
export const conversionService = new ConversionService();
```

### Zod Validation

```typescript
// ✅ Good - Request validation with Zod
// backend/lib/validators/kyc.ts

import { z } from 'zod';

export const bvnVerificationSchema = z.object({
  bvn: z
    .string()
    .length(11, 'BVN must be 11 digits')
    .regex(/^\d+$/, 'BVN must contain only numbers'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name too long'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export type BVNVerificationInput = z.infer<typeof bvnVerificationSchema>;

// Usage in API route:
// const validation = bvnVerificationSchema.safeParse(body);
// if (!validation.success) {
//   return NextResponse.json({ error: validation.error.errors }, { status: 400 });
// }
// const { bvn, firstName, lastName, dateOfBirth } = validation.data;
```

### Error Handling

```typescript
// ✅ Good - Custom error classes
// backend/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

// Usage:
// throw new ValidationError('Invalid BVN format', { field: 'bvn' });
```

### State Management (Zustand)

```typescript
// ✅ Good - Zustand store pattern
// frontend/store/useAppStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  kycStatus: string;
}

interface AppState {
  // State
  user: User | null;
  selectedAsset: 'USDC' | 'USDT';
  sidebarOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSelectedAsset: (asset: 'USDC' | 'USDT') => void;
  toggleSidebar: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  selectedAsset: 'USDC' as const,
  sidebarOpen: true,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set({ user }, false, 'setUser'),
        
        setSelectedAsset: (asset) => 
          set({ selectedAsset: asset }, false, 'setSelectedAsset'),
        
        toggleSidebar: () => 
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'nairaramp-storage',
        partialize: (state) => ({ selectedAsset: state.selectedAsset }),
      }
    ),
    { name: 'AppStore' }
  )
);

// Usage:
// const { user, setUser } = useAppStore();
// const selectedAsset = useAppStore((state) => state.selectedAsset);
```

### CSS / Tailwind Patterns

```typescript
// ✅ Good - Use cn() utility for conditional classes
// frontend/lib/utils/cn.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in component:
<button
  className={cn(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    'bg-primary text-white hover:bg-primary/90',
    isDisabled && 'opacity-50 cursor-not-allowed',
    className
  )}
>
  {children}
</button>
```

### Constants

```typescript
// ✅ Good - Centralized constants
// backend/lib/utils/constants.ts

export const CONVERSION = {
  MIN_AMOUNT: 10,
  MAX_AMOUNT: 10_000,
  FEE_PERCENT: 1.5,
  QUOTE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
} as const;

export const KYC_TIERS = {
  UNVERIFIED: 0,
  BASIC: 1,
  STANDARD: 2,
  PREMIUM: 3,
} as const;

export const TRANSACTION_STATUS = {
  PENDING_DEPOSIT: 'pending_deposit',
  DEPOSIT_RECEIVED: 'deposit_received',
  CONVERTING: 'converting',
  PAYOUT_PENDING: 'payout_pending',
  PAYOUT_PROCESSING: 'payout_processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
} as const;

export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];
```

---

## 🔀 Git Workflow

### Branch Naming

```bash
feature/add-conversion-widget    # New features
fix/bvn-validation-error         # Bug fixes
docs/update-api-reference        # Documentation
refactor/cleanup-stellar-client  # Code refactoring
test/add-payout-tests            # Test additions
chore/update-dependencies        # Maintenance
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <description>

# Examples
feat(conversion): add real-time rate display
fix(kyc): handle BVN validation edge case
docs(api): update payout endpoint documentation
refactor(stellar): simplify payment monitoring logic
test(payout): add Flutterwave webhook tests
chore(deps): update @stellar/stellar-sdk to v12
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `refactor` — Code refactoring
- `test` — Tests
- `chore` — Maintenance

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git checkout main
git rebase upstream/main

# Push to your fork
git push origin main
```

---

## 🔃 Pull Request Process

### Before Submitting

- [ ] Code follows project patterns
- [ ] TypeScript has no errors (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
- [ ] Documentation updated if needed
- [ ] Branch is up-to-date with main

### PR Title Format

```
feat(scope): Short description

# Examples
feat(kyc): Add BVN verification form
fix(payout): Handle failed webhook retries
docs(stellar): Add testnet setup guide
```

### PR Description Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring
- [ ] Tests

## Testing
How to test these changes.

## Screenshots (if UI changes)
Add screenshots here.

## Checklist
- [ ] Code follows project patterns
- [ ] Self-reviewed my code
- [ ] Added/updated tests
- [ ] Updated documentation
```

### Review Process

1. Submit PR
2. Automated checks run (lint, type-check, tests)
3. Request review from maintainers
4. Address feedback
5. Maintainer approves and merges

---

## 🧪 Testing Guidelines

### Test File Location

```
frontend/
└── __tests__/
    ├── components/
    │   └── ConversionWidget.test.tsx
    └── hooks/
        └── useConversionRate.test.ts

backend/
└── __tests__/
    ├── api/
    │   └── kyc.test.ts
    └── services/
        └── ConversionService.test.ts
```

### Test Naming

```typescript
// ✅ Good - Descriptive test names
describe('ConversionService', () => {
  describe('createQuote', () => {
    it('should calculate correct output amount with 1.5% fee', async () => {
      // ...
    });

    it('should throw error when amount is below minimum', async () => {
      // ...
    });

    it('should expire quote after 5 minutes', async () => {
      // ...
    });
  });
});
```

---

## 📝 Documentation

### When to Update Docs

- Adding new API endpoints → Update `docs/BACKEND.md`
- Adding new components → Update `docs/FRONTEND.md`
- Changing database schema → Update `docs/DATABASE.md`
- Adding environment variables → Update `.env.example`

### Code Comments

```typescript
// ✅ Good - Comment explains WHY, not WHAT
// We retry 3 times because bank APIs are occasionally unreliable
const MAX_RETRIES = 3;

// ✅ Good - JSDoc for public functions
/**
 * Initiates a bank payout via Flutterwave.
 * @param transactionId - The transaction to process
 * @throws {PayoutError} If payout initiation fails
 * @returns Payout confirmation details
 */
async function initiatePayout(transactionId: string): Promise<PayoutResult> {
  // ...
}

// ❌ Bad - Obvious comment
// Increment counter by 1
counter += 1;
```

---

## 🆘 Getting Help

- **Questions?** Open a [Discussion](https://github.com/nairaramp/naira-ramp/discussions)
- **Found a bug?** Open an [Issue](https://github.com/nairaramp/naira-ramp/issues)
- **Security issue?** Email security@nairaramp.com

---

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Our website

---

<p align="center">
  <strong>Thank you for contributing to NairaRamp! 🚀</strong>
</p>
