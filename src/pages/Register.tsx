import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthLayout, useWidgetTheme } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PasswordStrengthIndicator, isPasswordStrong } from '@/components/auth/PasswordStrengthIndicator';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AccountField, OrDivider, PasswordInput, accountInput, accountLink, primaryButton } from '@/components/account/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const widgetTheme = useWidgetTheme();
  // v2: avisa a diferença enquanto digita; a validação no envio continua.
  const mismatch = !!confirmPassword && confirmPassword !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong(password)) {
      toast({ title: 'Senha fraca', description: 'A senha não atende todos os requisitos.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    if (!captchaToken) {
      toast({ title: 'Confirmação necessária', description: 'Por favor, confirme que você não é um robô.', variant: 'destructive' });
      return;
    }
    if (!acceptedTerms) {
      toast({ title: 'Atenção', description: 'Você deve aceitar os termos de uso para criar uma conta.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, captchaToken, acceptTerms: true });
      const isApi = import.meta.env.VITE_USE_API === 'true';
      if (isApi) {
        navigate('/confirm-email', { state: { email } });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast({ title: 'Erro ao criar conta', description: err.message, variant: 'destructive' });
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string, nonce: string | null) => {
    try {
      await loginWithGoogle(credential, true, nonce);
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleGoogleError = () => {
    toast({ title: 'Erro', description: 'Falha ao autenticar com o Google.', variant: 'destructive' });
  };

  return (
    <AuthLayout title="Criar Conta" subtitle="Crie sua conta para salvar suas fichas">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <AccountField label="Nome" htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            placeholder="Seu nome"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className={accountInput}
          />
        </AccountField>

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

        <AccountField label="Senha" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <PasswordStrengthIndicator password={password} />
        </AccountField>

        <AccountField label="Confirmar Senha" htmlFor="confirmPassword" error={mismatch && 'As senhas não coincidem.'}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            aria-invalid={mismatch || undefined}
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

        <div className="flex min-h-[44px] items-center gap-2.5">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            className="h-5 w-5"
          />
          <label htmlFor="terms" className="cursor-pointer text-base">
            Li e aceito os <Link to="/terms-of-use" target="_blank" className={accountLink}>Termos de Uso</Link>
          </label>
        </div>

        <button
          type="submit"
          className={cn(primaryButton, 'w-full')}
          disabled={loading || !isPasswordStrong(password) || !captchaToken || !acceptedTerms}
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <OrDivider />

        <GoogleSignInButton label="Registrar com Google" onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={loading || !acceptedTerms} />

        <p className="mt-1 text-center text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/login" className={accountLink}>Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
