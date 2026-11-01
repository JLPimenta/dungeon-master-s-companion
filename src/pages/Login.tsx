import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthLayout, useWidgetTheme } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  AccountField, OrDivider, PasswordInput, accountInput, accountLink, dialogContent, dialogDescription, dialogTitle,
  outlineButton, primaryButton,
} from '@/components/account/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<string | null>(null);
  const [pendingGoogleNonce, setPendingGoogleNonce] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const widgetTheme = useWidgetTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast({ title: 'Confirmação necessária', description: 'Por favor, confirme que você não é um robô.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await login({ email, password, captchaToken });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Erro ao entrar', description: err.message, variant: 'destructive' });
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string, nonce: string | null) => {
    try {
      await loginWithGoogle(credential, undefined, nonce);
      navigate('/');
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('termos')) {
        setPendingGoogleCredential(credential);
        setPendingGoogleNonce(nonce);
        setAcceptedTerms(false);
      } else {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      }
    }
  };

  const handleConfirmGoogleRegistration = async () => {
    if (!pendingGoogleCredential) return;
    setLoading(true);
    try {
      await loginWithGoogle(pendingGoogleCredential, true, pendingGoogleNonce);
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setPendingGoogleCredential(null);
    }
  };

  const handleGoogleError = () => {
    toast({ title: 'Erro', description: 'Falha ao autenticar com o Google.', variant: 'destructive' });
  };

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta para gerenciar suas fichas">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <AccountField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={accountInput}
          />
        </AccountField>

        <AccountField
          label="Senha"
          htmlFor="password"
          aside={<Link to="/forgot-password" className={cn(accountLink, 'text-[15px]')}>Esqueceu sua senha?</Link>}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </AccountField>

        {/* reCAPTCHA */}
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={setCaptchaToken}
            onExpired={() => setCaptchaToken(null)}
            theme={widgetTheme}
          />
        </div>

        <button type="submit" className={cn(primaryButton, 'w-full')} disabled={loading || !captchaToken}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <OrDivider />

        <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={loading} />

        <p className="mt-1 text-center text-muted-foreground">
          Não tem uma conta?{' '}
          <Link to="/register" className={accountLink}>Criar conta</Link>
        </p>
      </form>

      <Dialog open={!!pendingGoogleCredential} onOpenChange={(open) => !open && setPendingGoogleCredential(null)}>
        <DialogContent className={cn(dialogContent, 'max-w-[440px]')}>
          <DialogHeader className="space-y-0 text-left">
            <DialogTitle className={dialogTitle}>Complete seu cadastro</DialogTitle>
            <DialogDescription className={dialogDescription}>
              Vimos que você ainda não tem uma conta. Para continuar com o Google, você precisa aceitar nossos Termos de Uso.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 flex min-h-[44px] items-center gap-2.5">
            <Checkbox
              id="terms-modal"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="h-5 w-5"
            />
            <label htmlFor="terms-modal" className="cursor-pointer text-base">
              Li e aceito os <Link to="/terms-of-use" target="_blank" className={accountLink}>Termos de Uso</Link>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" className={cn(outlineButton, 'h-11')} onClick={() => setPendingGoogleCredential(null)} disabled={loading}>
              Cancelar
            </button>
            <button
              type="button"
              className={cn(primaryButton, 'h-11 font-body text-base font-semibold tracking-normal')}
              onClick={handleConfirmGoogleRegistration}
              disabled={loading || !acceptedTerms}
            >
              {loading ? 'Confirmando...' : 'Confirmar e Entrar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
