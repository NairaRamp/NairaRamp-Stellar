# 📁 NairaRamp Project Structure

> Complete folder organization for the NairaRamp crypto off-ramp platform.

---

## Directory Tree

```
naira-ramp/
│
├── 📁 frontend/                          # Next.js Frontend Application
│   │
│   ├── 📁 app/                           # Next.js App Router
│   │   ├── 📁 (landing)/                 # Public landing page route group
│   │   │   ├── page.tsx                  # Landing page (hero, features, how it works, CTA)
│   │   │   └── layout.tsx                # Landing layout
│   │   │
│   │   ├── 📁 (auth)/                    # Authentication route group
│   │   │   ├── 📁 login/
│   │   │   │   └── page.tsx              # Login page
│   │   │   ├── 📁 register/
│   │   │   │   └── page.tsx              # Registration page
│   │   │   └── layout.tsx                # Auth layout
│   │   │
│   │   ├── 📁 (app)/                     # Protected app route group
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── page.tsx              # User dashboard with balance, recent txns
│   │   │   ├── 📁 convert/
│   │   │   │   └── page.tsx              # USDC/USDT → NGN conversion flow
│   │   │   ├── 📁 verify/
│   │   │   │   └── page.tsx              # BVN verification page
│   │   │   ├── 📁 transactions/
│   │   │   │   └── page.tsx              # Transaction history
│   │   │   ├── 📁 settings/
│   │   │   │   └── page.tsx              # User settings
│   │   │   └── layout.tsx                # App shell with sidebar/navbar
│   │   │
│   │   ├── layout.tsx                    # Root layout
│   │   └── globals.css                   # Global styles
│   │
│   ├── 📁 components/                    # React Components
│   │   ├── 📁 landing/                   # Landing page components
│   │   │   ├── Hero.tsx                  # Hero with particles background
│   │   │   ├── HowItWorks.tsx            # 3-step process section
│   │   │   ├── Features.tsx              # Feature showcase
│   │   │   ├── Stats.tsx                 # Statistics section
│   │   │   ├── Testimonials.tsx          # User testimonials
│   │   │   └── Footer.tsx                # Site footer
│   │   │
│   │   ├── 📁 app/                       # Dashboard components
│   │   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   │   ├── Navbar.tsx                # Top navigation bar
│   │   │   ├── ConversionWidget.tsx      # Conversion form widget
│   │   │   ├── TransactionTable.tsx      # Transaction list table
│   │   │   ├── RateDisplay.tsx           # Live USD/NGN rate ticker
│   │   │   └── WalletCard.tsx            # Wallet balance card
│   │   │
│   │   ├── 📁 kyc/                       # KYC components
│   │   │   ├── BVNForm.tsx               # BVN verification form
│   │   │   ├── KYCStatus.tsx             # KYC status display
│   │   │   └── VerificationSteps.tsx     # Step-by-step verification
│   │   │
│   │   ├── 📁 ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── 📁 shared/                    # Shared components
│   │   │   ├── ParticlesBackground.tsx   # tsparticles component
│   │   │   ├── LoadingSpinner.tsx        # Loading indicator
│   │   │   └── StatusBadge.tsx           # Status indicator badge
│   │   │
│   │   └── 📁 providers/                 # React context providers
│   │       ├── QueryProvider.tsx         # TanStack Query provider
│   │       └── ThemeProvider.tsx         # Theme context provider
│   │
│   ├── 📁 hooks/                         # Custom React hooks
│   │   ├── useStellarPayment.ts          # Real-time payment detection hook
│   │   ├── useConversionRate.ts          # Live rate hook with polling
│   │   ├── useKYCStatus.ts               # KYC status hook
│   │   └── useTransactions.ts            # Transaction data hook
│   │
│   ├── 📁 store/                         # State management
│   │   └── useAppStore.ts                # Zustand global store
│   │
│   ├── 📁 types/                         # TypeScript type definitions
│   │   ├── stellar.ts                    # Stellar-related types
│   │   ├── transaction.ts                # Transaction types
│   │   ├── kyc.ts                        # KYC types
│   │   └── user.ts                       # User types
│   │
│   └── 📁 lib/                           # Frontend utilities
│       └── 📁 utils/
│           ├── cn.ts                     # Class name utility (clsx + tailwind-merge)
│           └── format.ts                 # Formatting utilities
│
├── 📁 backend/                           # Backend API & Services
│   │
│   ├── 📁 api/                           # Next.js API Route Handlers
│   │   ├── 📁 stellar/
│   │   │   ├── generate-address/
│   │   │   │   └── route.ts              # Generate Stellar deposit address
│   │   │   ├── check-payment/
│   │   │   │   └── route.ts              # Check for incoming payment
│   │   │   └── webhook/
│   │   │       └── route.ts              # Stellar payment webhook
│   │   │
│   │   ├── 📁 conversion/
│   │   │   ├── quote/
│   │   │   │   └── route.ts              # Get conversion quote
│   │   │   └── execute/
│   │   │       └── route.ts              # Execute conversion
│   │   │
│   │   ├── 📁 payout/
│   │   │   └── initiate/
│   │   │       └── route.ts              # Initiate NGN bank payout
│   │   │
│   │   ├── 📁 kyc/
│   │   │   ├── verify-bvn/
│   │   │   │   └── route.ts              # Submit BVN verification
│   │   │   └── status/
│   │   │       └── route.ts              # Get KYC status
│   │   │
│   │   └── 📁 webhooks/
│   │       ├── flutterwave/
│   │       │   └── route.ts              # Flutterwave payout webhook
│   │       └── stellar/
│   │           └── route.ts              # Stellar payment webhook
│   │
│   ├── 📁 lib/                           # Backend libraries
│   │   ├── 📁 stellar/
│   │   │   ├── client.ts                 # Horizon client setup (Testnet)
│   │   │   ├── wallet.ts                 # Keypair generation, trustlines
│   │   │   ├── monitor.ts                # Real-time payment monitoring
│   │   │   └── assets.ts                 # USDC/USDT asset definitions
│   │   │
│   │   ├── 📁 supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   ├── server.ts                 # Server Supabase client
│   │   │   └── middleware.ts             # Auth middleware helpers
│   │   │
│   │   ├── 📁 flutterwave/
│   │   │   ├── payout.ts                 # NGN bank transfer
│   │   │   └── banks.ts                  # Nigerian bank list
│   │   │
│   │   ├── 📁 kyc/
│   │   │   └── dojah.ts                  # Dojah BVN verification
│   │   │
│   │   ├── 📁 rates/
│   │   │   └── exchange.ts               # FX rate fetching (live NGN/USD)
│   │   │
│   │   └── 📁 utils/
│   │       ├── format.ts                 # Formatting utilities
│   │       ├── validators.ts             # Input validation
│   │       └── constants.ts              # App constants
│   │
│   └── 📁 services/                      # Business logic services
│       ├── ConversionService.ts          # Conversion processing
│       ├── PayoutService.ts              # Payout handling
│       ├── KYCService.ts                 # KYC verification
│       └── StellarService.ts             # Stellar operations
│
├── 📁 supabase/                          # Supabase Configuration
│   │
│   ├── 📁 migrations/                    # Database migrations
│   │   ├── 001_users.sql                 # Users/profiles table
│   │   ├── 002_transactions.sql          # Transactions table
│   │   ├── 003_kyc.sql                   # KYC records table
│   │   ├── 004_wallets.sql               # Wallets table
│   │   └── 005_rates.sql                 # Exchange rates table
│   │
│   ├── seed.sql                          # Seed data for development
│   └── config.toml                       # Supabase local config
│
├── 📁 docs/                              # Documentation
│   │
│   ├── README.md                         # Docs index
│   ├── FRONTEND.md                       # Frontend architecture
│   ├── BACKEND.md                        # Backend API documentation
│   ├── DATABASE.md                       # Database schema & RLS
│   ├── STELLAR.md                        # Stellar integration guide
│   ├── KYC.md                            # KYC/BVN verification
│   ├── PAYOUT.md                         # Flutterwave payout guide
│   ├── REALTIME.md                       # Realtime features
│   └── DEPLOYMENT.md                     # Deployment guide
│
├── 📄 .env.example                       # Environment variables template
├── 📄 .gitignore                         # Git ignore rules
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 📄 README.md                          # Project overview
├── 📄 package.json                       # Dependencies & scripts
├── 📄 tsconfig.json                      # TypeScript configuration
├── 📄 tailwind.config.ts                 # Tailwind CSS configuration
├── 📄 next.config.ts                     # Next.js configuration
├── 📄 middleware.ts                      # Next.js middleware (auth)
├── 📄 postcss.config.mjs                 # PostCSS configuration
└── 📄 LICENSE                            # MIT License
```

---

## Directory Descriptions

### `/frontend`

The frontend directory contains all client-side code using Next.js App Router.

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js 14+ App Router pages and layouts |
| `components/` | Reusable React components organized by feature |
| `hooks/` | Custom React hooks for data fetching and state |
| `store/` | Zustand global state management |
| `types/` | TypeScript type definitions |
| `lib/utils/` | Frontend utility functions |

### `/backend`

The backend directory contains API routes and server-side logic.

| Directory | Purpose |
|-----------|---------|
| `api/` | Next.js API route handlers (endpoints) |
| `lib/` | Server-side libraries (Stellar, Supabase, etc.) |
| `services/` | Business logic layer |

### `/supabase`

Database configuration and migrations for Supabase/PostgreSQL.

| Directory | Purpose |
|-----------|---------|
| `migrations/` | SQL migration files (versioned) |
| `seed.sql` | Development seed data |

### `/docs`

Comprehensive documentation for developers.

| File | Purpose |
|------|---------|
| `FRONTEND.md` | Frontend architecture, routing, components |
| `BACKEND.md` | API endpoints, request/response schemas |
| `DATABASE.md` | Schema, migrations, RLS policies |
| `STELLAR.md` | Stellar blockchain integration |
| `KYC.md` | BVN verification with Dojah |
| `PAYOUT.md` | Flutterwave bank payouts |
| `REALTIME.md` | Supabase Realtime, streaming |
| `DEPLOYMENT.md` | Production deployment guide |

---

## Route Groups Explained

Next.js 14 App Router uses route groups for organization:

| Group | Path Pattern | Purpose |
|-------|--------------|---------|
| `(landing)` | `/` | Public landing page |
| `(auth)` | `/login`, `/register` | Authentication pages |
| `(app)` | `/dashboard`, `/convert`, etc. | Protected app pages |

Route groups (folders in parentheses) don't affect the URL structure but help organize layouts and middleware.

---

## Component Organization

### Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `ConversionWidget.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useConversionRate.ts`)
- **Types**: `camelCase.ts` (e.g., `transaction.ts`)
- **Utilities**: `camelCase.ts` (e.g., `format.ts`)
- **API Routes**: `route.ts` (Next.js convention)

### Component Categories

| Category | Location | Purpose |
|----------|----------|---------|
| Landing | `components/landing/` | Marketing/landing page components |
| App | `components/app/` | Dashboard and app UI components |
| KYC | `components/kyc/` | KYC verification components |
| UI | `components/ui/` | shadcn/ui base components |
| Shared | `components/shared/` | Common reusable components |
| Providers | `components/providers/` | React context providers |

---

## API Route Structure

API routes follow RESTful conventions:

```
/api/{domain}/{action}/route.ts
```

| Domain | Actions | Description |
|--------|---------|-------------|
| `stellar` | `generate-address`, `check-payment`, `webhook` | Stellar blockchain operations |
| `conversion` | `quote`, `execute` | Currency conversion |
| `payout` | `initiate` | Bank payouts |
| `kyc` | `verify-bvn`, `status` | KYC verification |
| `webhooks` | `flutterwave`, `stellar` | External webhook handlers |

---

## File Responsibilities

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and npm scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `tailwind.config.ts` | Tailwind CSS customization |
| `next.config.ts` | Next.js configuration |
| `middleware.ts` | Auth middleware for protected routes |
| `postcss.config.mjs` | PostCSS plugins |

### Environment Files

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables |
| `.env.local` | Local development variables (git-ignored) |

---

<p align="center">
  <em>This structure follows Next.js 14+ best practices with App Router.</em>
</p>
