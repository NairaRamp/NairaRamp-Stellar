export interface PayoutPayload {
  accountNumber: string;
  bankCode: string;
  amount: number;
  reference: string;
  narration?: string;
}

// Stub — implement Flutterwave transfer API when credentials are available
export async function initiateFlutterwavePayout(payload: PayoutPayload) {
  console.log('[Flutterwave] Initiating payout:', payload);
  throw new Error('Flutterwave integration not yet configured.');
}
