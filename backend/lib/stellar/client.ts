// Stellar SDK integration — add `@stellar/stellar-sdk` to backend deps when ready
// import { Keypair, Networks, TransactionBuilder } from '@stellar/stellar-sdk';

export const STELLAR_NETWORK = process.env.STELLAR_NETWORK ?? 'TESTNET';
export const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

export const USDC_ISSUER = process.env.USDC_ASSET_ISSUER ?? '';
export const USDT_ISSUER = process.env.USDT_ASSET_ISSUER ?? '';

export function getStellarConfig() {
  return {
    network: STELLAR_NETWORK,
    horizonUrl: HORIZON_URL,
    usdcIssuer: USDC_ISSUER,
    usdtIssuer: USDT_ISSUER,
  };
}
