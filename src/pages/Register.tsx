import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PasswordStrengthIndicator, isPasswordStrong } from '@/components/auth/PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
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

  const handleGoogleSuccess = async (credential: string) => {
    try {
      await loginWithGoogle(credential, true);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            placeholder="Seu nome"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Crie uma senha forte"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* reCAPTCHA */}
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={setCaptchaToken}
            onExpired={() => setCaptchaToken(null)}
            theme="dark"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm font-normal">
            Li e aceito os <Link to="/terms-of-use" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !isPasswordStrong(password) || !captchaToken || !acceptedTerms}
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </Button>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            ou
          </span>
        </div>

        <GoogleSignInButton label="Registrar com Google" onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={loading || !acceptedTerms} />

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
