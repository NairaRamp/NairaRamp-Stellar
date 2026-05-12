import { NextRequest, NextResponse } from 'next/server';

// POST /api/stellar/generate-address
// Generates a unique Stellar deposit address for a user
export async function POST(req: NextRequest) {
  try {
    // TODO: Generate child keypair from STELLAR_MASTER_SECRET_KEY + user ID
    // const { userId } = await req.json();
    return NextResponse.json({ address: 'PLACEHOLDER_ADDRESS' }, { status: 501 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
