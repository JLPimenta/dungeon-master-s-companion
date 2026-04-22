import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      await loginWithGoogle(pendingGoogleCredential, true);
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
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

        <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            ou
          </span>
        </div>

        <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={loading} />

        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </form>

      <Dialog open={!!pendingGoogleCredential} onOpenChange={(open) => !open && setPendingGoogleCredential(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete seu cadastro</DialogTitle>
            <DialogDescription>
              Vimos que você ainda não tem uma conta. Para continuar com o Google, você precisa aceitar nossos Termos de Uso.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="terms-modal"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <Label htmlFor="terms-modal" className="text-sm font-normal">
              Li e aceito os <Link to="/terms-of-use" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>
            </Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setPendingGoogleCredential(null)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmGoogleRegistration} disabled={loading || !acceptedTerms}>
              {loading ? 'Confirmando...' : 'Confirmar e Entrar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
