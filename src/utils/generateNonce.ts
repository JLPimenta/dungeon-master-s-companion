/**
 * Generates a cryptographic nonce for Google OAuth ID token replay protection.
 *
 * The nonce is stored in sessionStorage so it survives the Google popup flow
 * but is cleared when the browser tab closes. The backend must verify that
 * the nonce inside the Google ID token matches the one sent in the request body.
 */

const NONCE_KEY = 'dnd_oauth_nonce';

/** Generate a cryptographic random nonce and store it in sessionStorage. */
export function generateNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const nonce = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem(NONCE_KEY, nonce);
  return nonce;
}

/** Read and clear the stored nonce (one‑time use). */
export function consumeNonce(): string | null {
  const nonce = sessionStorage.getItem(NONCE_KEY);
  sessionStorage.removeItem(NONCE_KEY);
  return nonce;
}
