import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Erro ao entrar', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      // In a real implementation, the Google Sign-In SDK would provide the credential
      await loginWithGoogle('');
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            ou
          </span>
        </div>

        <GoogleSignInButton onClick={handleGoogle} disabled={loading} />

        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
