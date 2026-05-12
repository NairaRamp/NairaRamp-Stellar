'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp, Globe, Lock, Activity } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Settlement',
    body: "Stellar's 3–5 second block time means deposits are confirmed and NGN sent within minutes, not days.",
  },
  {
    icon: Shield,
    title: 'KYC Compliant',
    body: 'BVN verification via Dojah keeps you aligned with CBN regulations. Secure and fully compliant.',
  },
  {
    icon: TrendingUp,
    title: 'Live Market Rates',
    body: 'NGN/USD rates refresh every 30 seconds. No hidden spreads — you see exactly what you get before you send.',
  },
  {
    icon: Globe,
    title: 'Stellar Network',
    body: 'Built on Stellar — one of the fastest, cheapest blockchains for cross-border stablecoin transfers.',
  },
  {
    icon: Lock,
    title: 'Non-Custodial Deposits',
    body: 'Unique deposit addresses per transaction. Funds go on-chain first, reducing counterparty risk.',
  },
  {
    icon: Activity,
    title: 'Real-Time Tracking',
    body: 'Track every step live: blockchain confirmation → conversion → bank credit. Full audit trail.',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-paper border-t-2 border-ink py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="section-label">Why NairaRamp</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-black text-ink">
              Built for Nigerians
              <br />
              in crypto.
            </h2>
          </div>
          <p className="text-muted max-w-xs text-sm leading-relaxed md:text-right">
            Everything you need to move seamlessly from stablecoins to naira — nothing you don't.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border-2 border-ink">
          {FEATURES.map((f, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const isLastRow = row === Math.floor((FEATURES.length - 1) / 3);
            const isLastCol = col === 2 || i === FEATURES.length - 1;

            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.08 }}
                className={`p-7 bg-paper group hover:bg-brand-muted transition-colors duration-150
                  ${!isLastCol ? 'border-r-2 border-ink' : ''}
                  ${!isLastRow ? 'border-b-2 border-ink' : ''}`}
              >
                <div className="w-10 h-10 border-2 border-ink flex items-center justify-center bg-paper group-hover:bg-brand group-hover:border-brand transition-colors duration-150 mb-5">
                  <f.icon size={18} className="text-ink group-hover:text-paper transition-colors" strokeWidth={2} />
                </div>
                <h3 className="font-black text-base text-ink mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.body}</p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
