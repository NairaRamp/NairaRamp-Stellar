import Link from 'next/link';
import { Twitter, Github, MessageCircle } from 'lucide-react';

const LINKS: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Live Rates', href: '#rates' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'AML Policy', href: '#' },
  ],
  Support: [
    { label: 'Documentation', href: '#' },
    { label: 'Status', href: '#' },
    { label: 'Contact', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-ink border-t-2 border-ink">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b-2 border-white/10">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 bg-brand border-2 border-brand flex items-center justify-center">
                <span className="font-black text-paper text-xs">NR</span>
              </div>
              <span className="font-black text-base text-paper">NairaRamp</span>
            </Link>

            <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-xs">
              The fastest way to convert USDC and USDT to Nigerian Naira via the Stellar blockchain.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Github, label: 'GitHub' },
                { icon: MessageCircle, label: 'Discord' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 border-2 border-white/20 flex items-center justify-center text-white/50 hover:border-brand hover:text-brand transition-colors duration-100"
                >
                  <Icon size={16} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-paper text-xs font-black uppercase tracking-widest mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-white/50 hover:text-white text-sm transition-colors duration-100"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © 2025 NairaRamp. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Built with ♥ for Nigerians in Crypto
          </p>
        </div>

      </div>
    </footer>
  );
}
