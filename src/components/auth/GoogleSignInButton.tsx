import { GoogleLogin } from '@react-oauth/google';

interface GoogleSignInButtonProps {
  label?: string;
  disabled?: boolean;
  onSuccess: (credential: string) => void;
  onError?: () => void;
}

export function GoogleSignInButton({
  disabled,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  return (
    <div className={`flex w-full justify-center opacity-${disabled ? '50' : '100'} ${disabled ? 'pointer-events-none' : ''}`}>
      <GoogleLogin
        onSuccess={credentialResponse => {
          if (credentialResponse.credential) {
            onSuccess(credentialResponse.credential);
          } else {
            onError?.();
          }
        }}
        onError={() => onError?.()}
        theme="filled_black"
        size="large"
        width="100%"
        shape="rectangular"
        text="signin_with"
      />
    </div>
  );
}
