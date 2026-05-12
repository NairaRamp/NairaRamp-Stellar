'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-paper border-t-2 border-ink py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="bg-brand border-2 border-ink shadow-brut-lg p-12 md:p-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-10"
        >
          {/* Copy */}
          <div>
            <span className="inline-block text-xs font-black uppercase tracking-[0.15em] text-paper/70 bg-brand-dark border border-paper/30 px-3 py-1 mb-6">
              Get Started Free
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-paper leading-tight text-balance">
              Ready to convert?
              <br />
              It takes 5 minutes.
            </h2>
            <p className="mt-4 text-paper/75 max-w-md leading-relaxed">
              Join Nigerians already using NairaRamp to move from stablecoins
              to naira — instantly, securely, and at fair rates.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link
              href="/register"
              className="btn bg-paper text-ink border-2 border-paper shadow-none hover:bg-off active:translate-x-[2px] active:translate-y-[2px] text-base px-8 py-4 font-black"
            >
              Create Free Account
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <Link
              href="/login"
              className="text-center text-sm font-semibold text-paper/80 hover:text-paper underline underline-offset-4 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
