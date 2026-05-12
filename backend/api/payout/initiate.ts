import { NextRequest, NextResponse } from 'next/server';
import { initiateFlutterwavePayout } from '@/backend/lib/flutterwave/payout';

// POST /api/payout/initiate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await initiateFlutterwavePayout(body);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
