import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AccountField, ResultIcon, accountInput, accountLink, outlineButton, primaryButton } from '@/components/account/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Email Enviado" subtitle="Verifique sua caixa de entrada">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <ResultIcon><Mail /></ResultIcon>
          <p className="text-foreground/85">
            Se o email <strong className="text-foreground">{email}</strong> estiver cadastrado, você receberá um link para
            redefinir sua senha.
          </p>
          <Link to="/login" className={cn(outlineButton, 'w-full')}>Voltar para Login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Esqueceu sua Senha?" subtitle="Informe seu email para recuperar o acesso">
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

        <button type="submit" className={cn(primaryButton, 'w-full')} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
        </button>

        <p className="text-center">
          <Link to="/login" className={accountLink}>Voltar para Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
