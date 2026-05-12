'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const TRUST_POINTS = [
  'BVN-verified payouts',
  'No hidden fees',
  'Testnet live now',
];

const STATS = [
  { value: '₦1,612', sub: 'per USDC today' },
  { value: '< 5 min', sub: 'avg. settlement' },
  { value: '1.5%', sub: 'flat fee' },
];

export function Hero() {
  return (
    <section className="pt-16 min-h-screen bg-paper flex flex-col">

      {/* Top announcement bar */}
      <div className="bg-brand border-b-2 border-ink px-6 py-2.5 flex items-center justify-center gap-3">
        <span className="w-2 h-2 bg-paper rounded-full animate-pulse" />
        <p className="text-paper text-xs font-bold tracking-wide uppercase">
          Built on Stellar Blockchain · Testnet Active
        </p>
      </div>

      {/* Main hero */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 grid lg:grid-cols-2 gap-12 items-center py-20">

        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label mb-6 inline-block">
            USDC &amp; USDT → NGN
          </span>

          <h1 className="text-5xl lg:text-[4rem] font-black text-ink leading-[1.05] tracking-tight text-balance mt-4">
            Convert Crypto
            <br />
            <span className="text-brand">to Naira.</span>
            <br />
            Instantly.
          </h1>

          <p className="mt-6 text-muted text-lg leading-relaxed max-w-md">
            Off-ramp USDC and USDT on the Stellar network directly to any
            Nigerian bank account. Transparent rates, low fees, fast settlement.
          </p>

          {/* Trust */}
          <ul className="mt-6 space-y-2">
            {TRUST_POINTS.map((pt) => (
              <li key={pt} className="flex items-center gap-2 text-sm font-medium text-ink">
                <CheckCircle2 size={16} className="text-brand flex-shrink-0" strokeWidth={2.5} />
                {pt}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary text-base px-7 py-3.5">
              Start Converting
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <a href="#how-it-works" className="btn-outline text-base px-7 py-3.5">
              How it works
            </a>
          </div>
        </motion.div>

        {/* Right: stats card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block"
        >
          {/* Rate card */}
          <div className="card p-8 max-w-sm ml-auto">
            <p className="text-xs font-black uppercase tracking-widest text-muted mb-6">
              Live Snapshot
            </p>

            <div className="space-y-5">
              {STATS.map((stat, i) => (
                <div
                  key={stat.value}
                  className={`flex items-baseline justify-between pb-5 ${
                    i < STATS.length - 1 ? 'border-b-2 border-ink' : ''
                  }`}
                >
                  <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                    {stat.sub}
                  </span>
                  <span className="text-3xl font-black text-ink">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-ink">
              <Link href="/register" className="btn-primary w-full justify-center text-sm py-3">
                Create Free Account →
              </Link>
            </div>
          </div>

          {/* Small badge below card */}
          <div className="mt-4 flex items-center gap-2 justify-end pr-1">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs text-muted font-medium">Rates update every 30s</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom marquee ticker */}
      <div className="border-t-2 border-b-2 border-ink bg-brand overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-8">
              {['USDC → NGN  ₦1,612', 'USDT → NGN  ₦1,609', 'Fee: 1.5%', 'Stellar Testnet', 'Instant Settlement', 'KYC Required'].map((item) => (
                <span key={item} className="text-paper text-xs font-bold uppercase tracking-widest">
                  {item} &nbsp;·
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
