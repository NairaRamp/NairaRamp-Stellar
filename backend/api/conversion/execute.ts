import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/backend/lib/supabase/client';
import { createConversionQuote, normalizeAsset } from '@/backend/lib/conversion/quote';

interface ExecuteConversionPayload {
  quoteId?: string;
  userId: string;
  bankAccountId: string;
  amount: number;
  asset: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecuteConversionPayload;
    const { userId, bankAccountId, amount, asset } = body;

    if (!userId || !bankAccountId || !amount || amount <= 0 || !asset) {
      return NextResponse.json(
        { error: 'Missing or invalid conversion execute payload' },
        { status: 400 }
      );
    }

    const inputAsset = normalizeAsset(asset);
    const quote = await createConversionQuote(amount, inputAsset);
    const quoteId = body.quoteId ?? quote.quoteId;
    const depositMemo = quoteId.slice(0, 8).toUpperCase();
    const depositAddress =
      process.env.STELLAR_DEPOSIT_ADDRESS ??
      'GCFXUT7N2C5HPQIUH5XRXE6NB2VQ7YRQ6GZ72UTO2YRHZ7EMZQGMBR46';

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        input_asset: inputAsset,
        input_amount: amount,
        output_currency: 'NGN',
        output_amount: quote.outputAmount,
        exchange_rate: quote.exchangeRate,
        fee_amount: quote.feeAmount,
        fee_percent: quote.feePercent,
        status: 'pending_deposit',
        deposit_address: depositAddress,
        stellar_memo: depositMemo,
        notes: `Bank account ${bankAccountId}`,
      })
      .select('id')
      .single();

    if (error || !data) {
      const message = error?.message ?? 'Failed to create conversion transaction';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId: data.id,
        status: 'pending_deposit',
        depositAddress,
        depositMemo,
        inputAmount: quote.inputAmount,
        outputAmount: quote.outputAmount,
        quoteId,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
