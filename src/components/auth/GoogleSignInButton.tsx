import { GoogleLogin } from '@react-oauth/google';
import { generateNonce, consumeNonce } from '@/utils/generateNonce';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useWidgetTheme } from './AuthLayout';
import { outlineButton } from '@/components/account/ui';
import { isNativeApp } from '@/native/platform';
import { isGoogleSignInCancelled, signInWithGoogleNative } from '@/native/googleSignIn';

interface GoogleSignInButtonProps {
  /** "Registrar com Google" usa o texto de cadastro do botão oficial. */
  label?: string;
  disabled?: boolean;
  onSuccess: (credential: string, nonce: string | null) => void;
  onError?: () => void;
}

function NativeGoogleSignInButton({ label, disabled, onSuccess, onError }: GoogleSignInButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const { credential, nonce } = await signInWithGoogleNative();
      onSuccess(credential, nonce);
    } catch (err) {
      if (!isGoogleSignInCancelled(err)) onError?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={() => void handleClick()}
      className={cn(outlineButton, 'flex w-full items-center justify-center gap-2.5 disabled:pointer-events-none disabled:opacity-45')}
    >
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.9 2.4 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.2l8 6.2C12.5 13.7 17.8 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.9c-.6 3-2.2 5.5-4.8 7.2l7.7 6c4.5-4.2 7.1-10.3 7.1-17.7z" />
        <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-8-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.2 0-11.5-4.2-13.4-9.9l-8 6.2C6.5 42.6 14.6 48 24 48z" />
      </svg>
      {label ?? 'Entrar com Google'}
    </button>
  );
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  return isNativeApp ? <NativeGoogleSignInButton {...props} /> : <WebGoogleSignInButton {...props} />;
}

function WebGoogleSignInButton({
  label,
  disabled,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  // Generate a nonce once per mount — it's included in the Google ID token
  const nonce = useMemo(() => generateNonce(), []);
  const theme = useWidgetTheme();
  const isSignUp = !!label && /registr|cadastr/i.test(label);

  return (
    <div
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn('flex min-h-[44px] w-full justify-center transition-opacity', disabled && 'pointer-events-none opacity-45')}
    >
      <GoogleLogin
        onSuccess={credentialResponse => {
          if (credentialResponse.credential) {
            // Consume the nonce so it can't be reused
            const usedNonce = consumeNonce();
            onSuccess(credentialResponse.credential, usedNonce);
          } else {
            onError?.();
          }
        }}
        onError={() => onError?.()}
        nonce={nonce}
        theme={theme === 'light' ? 'outline' : 'filled_black'}
        size="large"
        width="100%"
        shape="rectangular"
        text={isSignUp ? 'signup_with' : 'signin_with'}
      />
    </div>
  );
}
