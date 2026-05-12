import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveRate, applyFee } from '@/backend/lib/rates/exchange';

// GET /api/conversion/quote?amount=100&asset=USDC
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get('amount') ?? '0');
    const asset = searchParams.get('asset') ?? 'USDC';

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const rate = await fetchLiveRate();
    const ngnGross = amount * rate.usdToNgn;
    const ngnNet = applyFee(ngnGross);

    return NextResponse.json({
      asset,
      amount,
      rate: rate.usdToNgn,
      grossNGN: ngnGross,
      netNGN: ngnNet,
      fee: ngnGross - ngnNet,
      updatedAt: rate.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
