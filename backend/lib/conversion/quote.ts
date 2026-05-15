import { fetchLiveRate, applyFee } from '@/backend/lib/rates/exchange';

export type AssetType = 'USDC' | 'USDT';

export interface ConversionQuote {
  quoteId: string;
  inputAmount: number;
  inputAsset: AssetType;
  outputCurrency: 'NGN';
  outputAmount: number;
  exchangeRate: number;
  feeAmount: number;
  feePercent: number;
  expiresAt: string;
  createdAt: string;
}

export function normalizeAsset(asset?: string): AssetType {
  const normalized = asset?.toUpperCase();
  if (normalized === 'USDT') return 'USDT';
  return 'USDC';
}

export async function createConversionQuote(
  amount: number,
  asset: string
): Promise<ConversionQuote> {
  const inputAsset = normalizeAsset(asset);
  const rate = await fetchLiveRate();
  const grossNGN = amount * rate.usdToNgn;
  const feePercent = 1.5;
  const netNGN = applyFee(grossNGN, feePercent);
  const feeAmount = grossNGN - netNGN;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

  return {
    quoteId: crypto.randomUUID(),
    inputAmount: amount,
    inputAsset,
    outputCurrency: 'NGN',
    outputAmount: parseFloat(netNGN.toFixed(2)),
    exchangeRate: parseFloat(rate.usdToNgn.toFixed(4)),
    feeAmount: parseFloat(feeAmount.toFixed(2)),
    feePercent,
    expiresAt,
    createdAt: now.toISOString(),
  };
}
