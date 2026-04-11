# 🎨 Frontend Architecture

> Frontend documentation for NairaRamp built with Next.js 14+ App Router.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Routing Strategy](#routing-strategy)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Theming & Design System](#theming--design-system)
- [Particles Setup](#particles-setup)
- [Protected Routes](#protected-routes)
- [Forms & Validation](#forms--validation)
- [Data Fetching](#data-fetching)

---

## Overview

The frontend is a Next.js 14+ application using the App Router architecture. It provides:

- **Landing page** with animated particles and modern design
- **Authentication** pages (login/register)
- **Protected dashboard** for authenticated users
- **Conversion flow** for USDC/USDT → NGN
- **Real-time updates** for transaction status

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | React framework with App Router |
| TypeScript | 5.0+ | Type safety |
| Tailwind CSS | 3.4+ | Utility-first CSS |
| shadcn/ui | Latest | Accessible UI components |
| tsparticles | 3.x | Particle animations |
| Framer Motion | 11+ | Animations |
| Zustand | 4.x | Global state |
| TanStack Query | 5.x | Server state |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| Lucide React | Latest | Icons |
| Sonner | 1.x | Toast notifications |

---

## Routing Strategy

### Route Groups

```
frontend/app/
├── (landing)/          # Public landing page
│   ├── page.tsx        # → /
│   └── layout.tsx
│
├── (auth)/             # Authentication
│   ├── login/
│   │   └── page.tsx    # → /login
│   ├── register/
│   │   └── page.tsx    # → /register
│   └── layout.tsx
│
└── (app)/              # Protected app
    ├── dashboard/
    │   └── page.tsx    # → /dashboard
    ├── convert/
    │   └── page.tsx    # → /convert
    ├── verify/
    │   └── page.tsx    # → /verify
    ├── transactions/
    │   └── page.tsx    # → /transactions
    ├── settings/
    │   └── page.tsx    # → /settings
    └── layout.tsx
```

### Route Group Benefits

- **(landing)** — Standalone layout with particles background
- **(auth)** — Minimal layout for auth pages
- **(app)** — Full app layout with sidebar and navbar

---

## Component Architecture

### Component Categories

```
frontend/components/
├── landing/            # Landing page specific
├── app/                # Dashboard/app specific
├── kyc/                # KYC verification
├── ui/                 # shadcn/ui base components
├── shared/             # Reusable across all
└── providers/          # React context providers
```

### Component Guidelines

```typescript
// Example component structure
// components/app/ConversionWidget.tsx

import { FC } from 'react';
import { Card } from '@/components/ui/card';

interface ConversionWidgetProps {
  // Define props with TypeScript
}

export const ConversionWidget: FC<ConversionWidgetProps> = (props) => {
  // Component logic
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
};
```

### Key Components to Implement

| Component | Location | Description |
|-----------|----------|-------------|
| `Hero` | `landing/` | Particles background, headline, CTA |
| `HowItWorks` | `landing/` | 3-step process visualization |
| `Features` | `landing/` | Feature cards grid |
| `ConversionWidget` | `app/` | Main conversion form |
| `TransactionTable` | `app/` | Transaction history |
| `RateDisplay` | `app/` | Live exchange rate ticker |
| `BVNForm` | `kyc/` | BVN verification form |
| `ParticlesBackground` | `shared/` | tsparticles wrapper |

---

## State Management

### Zustand Store Structure

```typescript
// store/useAppStore.ts

interface AppState {
  // User state
  user: User | null;
  kycStatus: KYCStatus;
  
  // Conversion state
  selectedAsset: 'USDC' | 'USDT';
  amount: string;
  
  // UI state
  sidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setAmount: (amount: string) => void;
  toggleSidebar: () => void;
}
```

### Server State with TanStack Query

```typescript
// hooks/useConversionRate.ts

export function useConversionRate() {
  return useQuery({
    queryKey: ['conversion-rate'],
    queryFn: fetchExchangeRate,
    refetchInterval: 30000, // Poll every 30s
    staleTime: 10000,
  });
}
```

---

## Theming & Design System

### Color Palette

```typescript
// tailwind.config.ts

colors: {
  primary: {
    DEFAULT: '#2563EB',    // Primary Blue
    // ... shades
  },
  accent: {
    DEFAULT: '#0EA5E9',    // Light Blue
    // ... shades
  },
  dark: {
    DEFAULT: '#0F172A',    // Dark Navy
    // ... shades
  },
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}
```

### Typography

- **Font Family**: Inter (sans-serif)
- **Headings**: Bold, dark navy
- **Body**: Regular, with muted variants

### Design Patterns

- **Glassmorphism** for dashboard cards
- **Subtle shadows** for depth
- **Rounded corners** (0.75rem default)
- **Smooth transitions** (0.2-0.3s)

---

## Particles Setup

### Installation

```bash
pnpm add @tsparticles/react @tsparticles/slim @tsparticles/engine
```

### Configuration

```typescript
// components/shared/ParticlesBackground.tsx

const particlesOptions = {
  particles: {
    number: { value: 80 },
    color: { value: '#2563EB' },
    links: {
      enable: true,
      color: '#0EA5E9',
      opacity: 0.3,
    },
    move: {
      enable: true,
      speed: 1,
    },
    opacity: { value: 0.5 },
    size: { value: { min: 1, max: 3 } },
  },
  background: {
    color: 'transparent',
  },
};
```

---

## Protected Routes

### Middleware Configuration

```typescript
// middleware.ts

const protectedPaths = [
  '/dashboard',
  '/convert',
  '/verify',
  '/transactions',
  '/settings',
];

// Redirect unauthenticated users to /login
```

### Client-Side Protection

```typescript
// hooks/useRequireAuth.ts

export function useRequireAuth() {
  const router = useRouter();
  const { user, isLoading } = useAppStore();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  return { user, isLoading };
}
```

---

## Forms & Validation

### Form Setup with React Hook Form + Zod

```typescript
// Example: BVN Form Schema

import { z } from 'zod';

export const bvnSchema = z.object({
  bvn: z.string()
    .length(11, 'BVN must be 11 digits')
    .regex(/^\d+$/, 'BVN must contain only numbers'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

export type BVNFormData = z.infer<typeof bvnSchema>;
```

### Form Component Pattern

```typescript
// components/kyc/BVNForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function BVNForm() {
  const form = useForm<BVNFormData>({
    resolver: zodResolver(bvnSchema),
    defaultValues: {
      bvn: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
    },
  });

  const onSubmit = async (data: BVNFormData) => {
    // Submit to API
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Data Fetching

### API Client Pattern

```typescript
// lib/utils/api.ts

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
}
```

### Query Hooks Pattern

```typescript
// hooks/useTransactions.ts

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => apiClient<Transaction[]>('/transactions'),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionDTO) =>
      apiClient('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ConversionWidget.tsx` |
| Hooks | camelCase with `use` | `useConversionRate.ts` |
| Utilities | camelCase | `format.ts` |
| Types | camelCase | `transaction.ts` |
| Constants | SCREAMING_SNAKE | `CONSTANTS.ts` |

---

## Next Steps for Contributors

1. Set up shadcn/ui components in `components/ui/`
2. Implement `ParticlesBackground` component
3. Build landing page components
4. Create app layout with sidebar
5. Implement conversion widget
6. Add form components with validation

---

<p align="center">
  <em>See BACKEND.md for API integration details.</em>
</p>
