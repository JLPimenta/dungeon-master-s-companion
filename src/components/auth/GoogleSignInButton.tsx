import { GoogleLogin } from '@react-oauth/google';
import { generateNonce, consumeNonce } from '@/utils/generateNonce';
import { useMemo } from 'react';

interface GoogleSignInButtonProps {
  label?: string;
  disabled?: boolean;
  onSuccess: (credential: string, nonce: string | null) => void;
  onError?: () => void;
}

export function GoogleSignInButton({
  disabled,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  // Generate a nonce once per mount — it's included in the Google ID token
  const nonce = useMemo(() => generateNonce(), []);

  return (
    <div className={`flex w-full justify-center opacity-${disabled ? '50' : '100'} ${disabled ? 'pointer-events-none' : ''}`}>
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
        theme="filled_black"
        size="large"
        width="100%"
        shape="rectangular"
        text="signin_with"
      />
    </div>
  );
}
