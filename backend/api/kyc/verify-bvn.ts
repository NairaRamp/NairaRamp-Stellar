import { NextRequest, NextResponse } from 'next/server';
import { verifyBVN } from '@/backend/lib/kyc/dojah';

// POST /api/kyc/verify-bvn
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await verifyBVN(body);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
