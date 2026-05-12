export interface BVNVerifyPayload {
  bvn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

// Stub — implement Dojah BVN verification when credentials are available
export async function verifyBVN(payload: BVNVerifyPayload) {
  console.log('[Dojah] Verifying BVN:', payload.bvn);
  throw new Error('Dojah integration not yet configured.');
}
