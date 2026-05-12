'use client';

import { motion } from 'framer-motion';
import { UserCheck, ArrowRightLeft, Landmark } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: UserCheck,
    title: 'Verify Identity',
    body: 'Complete BVN verification via Dojah in under 2 minutes. One-time process, fully compliant with Nigerian financial regulations.',
  },
  {
    number: '02',
    icon: ArrowRightLeft,
    title: 'Send Stablecoins',
    body: 'Get a unique Stellar deposit address. Send USDC or USDT from any wallet. We monitor the blockchain and confirm in real-time.',
  },
  {
    number: '03',
    icon: Landmark,
    title: 'Receive Naira',
    body: 'Once confirmed on-chain we convert at the live rate and transfer NGN directly to your bank account — usually within 5 minutes.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-off border-t-2 border-ink py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16">
          <span className="section-label">Process</span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-black text-ink">
            Three steps.
            <br />
            Under five minutes.
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-0 border-2 border-ink">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`p-8 bg-paper ${
                i < STEPS.length - 1 ? 'md:border-r-2 border-ink' : ''
              } border-b-2 md:border-b-0 border-ink`}
            >
              {/* Step number */}
              <span className="text-6xl font-black text-faint leading-none select-none">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mt-4 w-12 h-12 bg-brand border-2 border-ink flex items-center justify-center shadow-brut-sm">
                <step.icon size={22} className="text-paper" strokeWidth={2} />
              </div>

              <h3 className="mt-6 text-xl font-black text-ink">{step.title}</h3>
              <p className="mt-3 text-muted text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-xs text-muted font-medium">
          * Stellar testnet is used for development. Mainnet deployment coming soon.
        </p>
      </div>
    </section>
  );
}
