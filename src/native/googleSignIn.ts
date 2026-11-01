import { generateNonce, consumeNonce } from '@/utils/generateNonce';

let initialized = false;

/**
 * Login com Google pelo Credential Manager do Android. O fluxo web do botão oficial é
 * bloqueado pelo Google em WebView. O ID token tem como `aud` o mesmo cliente web
 * (VITE_GOOGLE_CLIENT_ID), então a API valida igual ao login do site.
 */
export async function signInWithGoogleNative(): Promise<{ credential: string; nonce: string | null }> {
  // Importação tardia para o plugin não entrar no bundle do site.
  const { SocialLogin } = await import('@capgo/capacitor-social-login');

  if (!initialized) {
    await SocialLogin.initialize({
      google: { webClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID, mode: 'online' },
    });
    initialized = true;
  }

  const { result } = await SocialLogin.login({
    provider: 'google',
    options: { nonce: generateNonce() },
  });
  const nonce = consumeNonce();

  if (result.responseType !== 'online' || !result.idToken) {
    throw new Error('O Google não retornou um token de identidade.');
  }
  return { credential: result.idToken, nonce };
}

/** O usuário fechou o seletor de contas: não é erro para mostrar. */
export function isGoogleSignInCancelled(err: unknown): boolean {
  const { code, message } = (err ?? {}) as { code?: string; message?: string };
  return code === 'USER_CANCELLED' || /cancel/i.test(message ?? '');
}
