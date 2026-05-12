# NairaRamp

**Convert USDC and USDT to Nigerian Naira — instantly, on Stellar.**

[Live Site](https://naira-ramp-stellar.vercel.app/) · [Demo Video](https://www.loom.com/share/dfde4121be4348bbbb6ac53c68aa5063) · [Docs](./docs/README.md)

---

NairaRamp is a crypto off-ramp platform built on the Stellar blockchain. Send stablecoins to a generated deposit address, pass BVN verification once, and receive Naira directly in your bank account within minutes.

## Why NairaRamp

Most Nigerian crypto holders can't get their money out easily. Existing platforms charge high fees, take days to settle, or lack proper KYC. NairaRamp fixes that:

- **Fast** — Stellar confirms in 3–5 seconds. NGN hits your account in under 5 minutes.
- **Transparent** — Live market rates, 1.5% flat fee, no hidden spreads.
- **Compliant** — One-time BVN verification via Dojah. CBN-aligned.
- **Direct** — Funds go from your wallet → Stellar → your Nigerian bank. No P2P counterparty risk.

## How It Works

1. **Verify** — Complete BVN verification once (under 2 minutes).
2. **Send** — Get a unique Stellar deposit address and send USDC or USDT.
3. **Receive** — We convert at the live rate and transfer NGN to your bank.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes, Stellar SDK |
| Database | Supabase (PostgreSQL + Realtime + Auth) |
| KYC | Dojah (BVN verification) |
| Payouts | Flutterwave |
| Infra | Vercel, Upstash Redis |

## Getting Started

```bash
git clone https://github.com/your-org/nairaramp.git
cd nairaramp/frontend
pnpm install
cp ../.env.example .env.local   # fill in your keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

See [docs/README.md](./docs/README.md) for full setup, API reference, and deployment guide.

## Contributing

1. Fork → feature branch → PR against `main`.
2. Follow the patterns in [docs/FRONTEND.md](./docs/FRONTEND.md) and [docs/BACKEND.md](./docs/BACKEND.md).
3. Keep commits meaningful — one concern per commit.

## License

MIT — see [LICENSE](./LICENSE).
