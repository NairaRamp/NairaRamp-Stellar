# 🚀 NairaRamp

> **Convert Your Crypto to Naira — Instantly.**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-7C3AED?style=flat-square&logo=stellar)](https://stellar.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**NairaRamp** is a USDC and USDT off-ramp platform built on the Stellar blockchain (Testnet first). Users can connect their Stellar wallet or send stablecoins to a generated deposit address, complete BVN verification, and receive Nigerian Naira directly in their bank account in near real-time.

### Why NairaRamp?

- ⚡ **Instant Conversions** — Real-time Stellar blockchain monitoring
- 🔒 **Secure** — BVN verification and bank-grade security
- 💸 **Low Fees** — Competitive rates with transparent pricing
- 🏦 **Direct Bank Transfers** — NGN sent directly to Nigerian bank accounts
- 🌐 **Built on Stellar** — Fast, cheap, and reliable blockchain infrastructure

---

## 🔥 Problem Statement

Nigerians holding stablecoins (USDC/USDT) face significant challenges converting their crypto to local currency:

1. **Limited Access** — Few platforms support direct NGN payouts
2. **High Fees** — Existing solutions charge excessive conversion fees
3. **Slow Processing** — Traditional exchanges take days to process withdrawals
4. **Trust Issues** — P2P platforms carry counterparty risks
5. **Regulatory Compliance** — Many platforms lack proper KYC/AML procedures

**NairaRamp solves these problems** by providing a compliant, fast, and affordable off-ramp solution built on Stellar's efficient blockchain infrastructure.

---

## ✨ Features

### Core Features
- [ ] **Stellar Wallet Integration** — Connect existing wallet or generate deposit address
- [ ] **USDC/USDT Support** — Convert both major stablecoins
- [ ] **Real-time Rate Display** — Live NGN/USD exchange rates
- [ ] **BVN Verification** — Compliant KYC via Dojah API
- [ ] **Instant Bank Payouts** — Direct NGN transfers via Flutterwave
- [ ] **Transaction Tracking** — Real-time status updates

### User Experience
- [ ] **Modern Landing Page** — Animated particles, glassmorphism design
- [ ] **Responsive Dashboard** — Works on all devices
- [ ] **Transaction History** — Complete audit trail
- [ ] **Email Notifications** — Status updates via email

### Technical Features
- [ ] **Stellar Testnet** — Development on testnet first
- [ ] **Real-time Monitoring** — Horizon streaming for payments
- [ ] **Webhook Integration** — Stellar and Flutterwave webhooks
- [ ] **Rate Limiting** — Upstash Redis for API protection
- [ ] **Row Level Security** — Supabase RLS for data protection

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible UI components |
| **tsparticles** | Animated particle backgrounds |
| **Framer Motion** | Smooth animations |
| **Zustand** | Global state management |
| **TanStack Query v5** | Server state & caching |
| **React Hook Form + Zod** | Form handling & validation |
| **Lucide React** | Icon system |
| **Sonner** | Toast notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Stellar SDK** | Blockchain integration |
| **Supabase** | Auth, Database, Realtime |
| **Dojah API** | BVN verification (KYC) |
| **Flutterwave API** | NGN bank payouts |
| **Upstash Redis** | Rate limiting & caching |
| **Svix** | Webhook verification |

### Database

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database (via Supabase) |
| **Supabase Realtime** | Live transaction updates |
| **Row Level Security** | Data access control |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Landing   │  │  Dashboard  │  │  Conversion │             │
│  │    Page     │  │    App      │  │    Flow     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Stellar  │  │   KYC    │  │ Convert  │  │  Payout  │        │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    STELLAR      │  │    SUPABASE     │  │   EXTERNAL      │
│   BLOCKCHAIN    │  │    DATABASE     │  │     APIs        │
│  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │
│  │  Horizon  │  │  │  │  Auth     │  │  │  │  Dojah    │  │
│  │  Testnet  │  │  │  │  Postgres │  │  │  │  (KYC)    │  │
│  │  USDC/    │  │  │  │  Realtime │  │  │  ├───────────┤  │
│  │  USDT     │  │  │  │  Storage  │  │  │  │Flutterwave│  │
│  └───────────┘  │  │  └───────────┘  │  │  │ (Payouts) │  │
└─────────────────┘  └─────────────────┘  │  └───────────┘  │
                                          └─────────────────┘
```

### User Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Landing │───▶│ Register │───▶│  BVN     │───▶│ Convert  │───▶│  Payout  │
│   Page   │    │  /Login  │    │  Verify  │    │  Crypto  │    │   NGN    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                      ▼
                                               ┌──────────┐
                                               │ Stellar  │
                                               │ Deposit  │
                                               │ Monitor  │
                                               └──────────┘
```

---

## 📁 Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed folder organization.

```
naira-ramp/
├── frontend/               # Next.js frontend application
├── backend/                # API routes and server logic
├── docs/                   # Project documentation
├── supabase/               # Database migrations and config
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── PROJECT_STRUCTURE.md    # Detailed structure documentation
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17+ 
- **pnpm** (recommended) or npm/yarn
- **Supabase** account
- **Stellar** testnet account
- **Dojah** API credentials
- **Flutterwave** API credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/naira-ramp.git
cd naira-ramp

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables (see below)

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔐 Environment Variables

See [.env.example](./.env.example) for all required variables.

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `STELLAR_NETWORK` | `TESTNET` or `PUBLIC` | ✅ |
| `STELLAR_HORIZON_URL` | Horizon API endpoint | ✅ |
| `STELLAR_MASTER_SECRET_KEY` | Master key for addresses | ✅ |
| `USDC_ASSET_ISSUER` | USDC asset issuer address | ✅ |
| `USDT_ASSET_ISSUER` | USDT asset issuer address | ✅ |
| `DOJAH_APP_ID` | Dojah application ID | ✅ |
| `DOJAH_API_KEY` | Dojah API key | ✅ |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave secret key | ✅ |
| `FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | ✅ |
| `WEBHOOK_SECRET` | Webhook signature secret | ✅ |

---

## 📡 API Reference

See [docs/BACKEND.md](./docs/BACKEND.md) for complete API documentation.

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/stellar/generate-address` | Generate deposit address |
| `GET` | `/api/stellar/check-payment` | Check for incoming payment |
| `POST` | `/api/stellar/webhook` | Stellar payment webhook |
| `GET` | `/api/conversion/quote` | Get conversion quote |
| `POST` | `/api/conversion/execute` | Execute conversion |
| `POST` | `/api/payout/initiate` | Initiate NGN payout |
| `POST` | `/api/kyc/verify-bvn` | Submit BVN for verification |
| `GET` | `/api/kyc/status` | Get KYC status |

---

## 🗃️ Database Schema

See [docs/DATABASE.md](./docs/DATABASE.md) for complete schema documentation.

### Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with BVN status |
| `wallets` | Generated Stellar deposit addresses |
| `transactions` | Conversion transaction records |
| `kyc_records` | BVN verification attempts |
| `exchange_rates` | Cached NGN/USD rates |
| `payouts` | Flutterwave payout records |

---

## 🌐 Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete deployment guide.

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

### Production Checklist

- [ ] Configure all environment variables
- [ ] Set up Supabase project
- [ ] Configure Stellar mainnet (after testing)
- [ ] Set up Flutterwave production keys
- [ ] Configure Dojah production API
- [ ] Set up monitoring and alerts
- [ ] Enable SSL/HTTPS
- [ ] Configure rate limiting

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines below.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed

### Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring
- `test/` — Test additions

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 📞 Support

- 📧 Email: support@nairaramp.com
- 💬 Discord: [Join our community](https://discord.gg/nairaramp)
- 🐦 Twitter: [@NairaRamp](https://twitter.com/nairaramp)

---

<p align="center">
  <strong>Built with ❤️ for Nigerians in Crypto</strong>
</p>
