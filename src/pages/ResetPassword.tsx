import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast({ title: 'Sucesso', description: 'Senha redefinida com sucesso!' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Link Inválido">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <Button variant="outline" asChild>
            <Link to="/forgot-password">Solicitar novo link</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Redefinir Senha" subtitle="Crie uma nova senha para sua conta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Voltar para Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
