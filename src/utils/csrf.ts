/**
 * Extracts the Anti-CSRF token from the document cookies.
 * The backend should set this cookie to a secure, non-HttpOnly value (e.g. CSRF-TOKEN)
 * so the frontend can read it and send it as a header on mutating requests.
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  // Usually backends use 'XSRF-TOKEN' or 'CSRF-TOKEN' as the cookie name.
  // We'll check for both, but ideally standardizing on 'XSRF-TOKEN'.
  const match = document.cookie.match(/(?:^|;\s*)(?:XSRF-TOKEN|CSRF-TOKEN)=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}
