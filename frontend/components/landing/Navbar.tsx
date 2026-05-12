'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Rates', href: '#rates' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-paper border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand border-2 border-ink flex items-center justify-center shadow-brut-sm group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all duration-100">
            <span className="font-black text-paper text-xs leading-none">NR</span>
          </div>
          <span className="font-black text-base text-ink tracking-tight">
            NairaRamp
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-semibold text-ink hover:bg-faint transition-colors duration-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm font-semibold px-4 py-2">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Get Started →
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 border-2 border-ink hover:bg-faint transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t-2 border-ink bg-paper px-6 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-semibold text-ink border-b border-faint hover:text-brand transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" className="btn-outline w-full justify-center">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary w-full justify-center">
              Get Started →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
