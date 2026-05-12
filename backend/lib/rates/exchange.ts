export interface ExchangeRate {
  usdToNgn: number;
  updatedAt: string;
}

// Stub — replace with live feed (e.g. ExchangeRate-API, CBN, or Flutterwave rates)
export async function fetchLiveRate(): Promise<ExchangeRate> {
  return {
    usdToNgn: 1612,
    updatedAt: new Date().toISOString(),
  };
}

export function applyFee(amount: number, feePercent = 1.5): number {
  return amount * (1 - feePercent / 100);
}
