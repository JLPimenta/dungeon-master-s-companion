import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordStrengthIndicator, isPasswordStrong } from '@/components/auth/PasswordStrengthIndicator';
import { cn } from '@/lib/utils';
import { AccountField, PasswordInput, ResultIcon, accountLink, outlineButton, primaryButton } from '@/components/account/ui';
import { AlertTriangle } from 'lucide-react';
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
  const mismatch = !!confirmPassword && confirmPassword !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    if (!isPasswordStrong(password)) {
      toast({ title: 'Senha fraca', description: 'A senha não atende todos os requisitos.', variant: 'destructive' });
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
        <div className="flex flex-col items-center gap-3.5 text-center">
          <ResultIcon tone="danger"><AlertTriangle /></ResultIcon>
          <p className="text-foreground/85">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <Link to="/forgot-password" className={cn(outlineButton, 'w-full')}>Solicitar novo link</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Redefinir Senha" subtitle="Crie uma nova senha para sua conta">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <AccountField label="Nova Senha" htmlFor="password">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Crie uma nova senha forte"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <PasswordStrengthIndicator password={password} />
        </AccountField>

        <AccountField label="Confirmar Nova Senha" htmlFor="confirmPassword" error={mismatch && 'As senhas não coincidem.'}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            aria-invalid={mismatch || undefined}
            required
          />
        </AccountField>

        <button type="submit" className={cn(primaryButton, 'w-full')} disabled={loading || !isPasswordStrong(password)}>
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>

        <p className="text-center">
          <Link to="/login" className={accountLink}>Voltar para Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
