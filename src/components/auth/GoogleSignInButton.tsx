import { GoogleLogin } from '@react-oauth/google';
import { generateNonce, consumeNonce } from '@/utils/generateNonce';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useWidgetTheme } from './AuthLayout';

interface GoogleSignInButtonProps {
  /** "Registrar com Google" usa o texto de cadastro do botão oficial. */
  label?: string;
  disabled?: boolean;
  onSuccess: (credential: string, nonce: string | null) => void;
  onError?: () => void;
}

export function GoogleSignInButton({
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
