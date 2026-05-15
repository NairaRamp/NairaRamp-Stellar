import { NextRequest, NextResponse } from 'next/server';
import { createConversionQuote } from '@/backend/lib/conversion/quote';

// GET /api/conversion/quote?amount=100&asset=USDC
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get('amount') ?? '0');
    const asset = searchParams.get('asset') ?? 'USDC';

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const quote = await createConversionQuote(amount, asset);

    return NextResponse.json({ success: true, data: quote });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
