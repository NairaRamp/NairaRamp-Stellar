import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NairaRamp — Convert Crypto to Naira Instantly',
  description:
    'Off-ramp USDC and USDT on Stellar directly to your Nigerian bank account. Secure, fast, and at the best available rates.',
  keywords: ['USDC', 'USDT', 'Naira', 'Stellar', 'crypto off-ramp', 'Nigeria'],
  openGraph: {
    title: 'NairaRamp — Convert Crypto to Naira Instantly',
    description: 'The fastest way to convert stablecoins to Nigerian Naira via Stellar.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
