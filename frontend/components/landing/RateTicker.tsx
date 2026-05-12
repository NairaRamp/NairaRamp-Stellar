'use client';

import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp } from 'lucide-react';

const RATES = [
  { asset: 'USDC', pair: 'USDC / NGN', rate: '₦1,612', change: '+0.4%', positive: true },
  { asset: 'USDT', pair: 'USDT / NGN', rate: '₦1,609', change: '+0.2%', positive: true },
];

export function RateTicker() {
  return (
    <section id="rates" className="bg-off border-t-2 border-ink py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="section-label">Live Rates</span>
            <h2 className="mt-4 text-4xl font-black text-ink">
              Today's Exchange Rates
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted font-medium">
            <RefreshCw size={13} strokeWidth={2.5} />
            <span>Updated every 30 seconds</span>
          </div>
        </div>

        {/* Rate cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {RATES.map((r, i) => (
            <motion.div
              key={r.asset}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card p-8"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-muted">{r.pair}</span>
                  <div className="mt-3 text-5xl font-black text-ink">{r.rate}</div>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-muted border-2 border-brand px-3 py-1.5">
                  <TrendingUp size={13} className="text-brand" strokeWidth={2.5} />
                  <span className="text-xs font-black text-brand">{r.change} 24h</span>
                </div>
              </div>

              <div className="divider pt-6 flex items-center justify-between">
                <span className="text-xs text-muted font-medium">After 1.5% fee</span>
                <span className="text-sm font-black text-ink">
                  {r.asset === 'USDC' ? '₦1,587' : '₦1,585'} / unit
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-muted">
          Rates are indicative. Final rate locked at transaction confirmation.
        </p>
      </div>
    </section>
  );
}
