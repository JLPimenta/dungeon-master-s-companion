import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { confirmEmail } = useAuth();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    token ? 'pending' : 'success'
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    confirmEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setErrorMsg(err.message);
      });
  }, [token]);

  if (!token) {
    // Shown after registration — no token yet
    return (
      <AuthLayout title="Verifique seu Email" subtitle="Quase lá!">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mail className="h-12 w-12 text-primary" />
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para o seu email. Verifique sua caixa
            de entrada e clique no link para ativar sua conta.
          </p>
          <Button variant="outline" asChild className="mt-2">
            <Link to="/login">Voltar para Login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={status === 'success' ? 'Email Confirmado!' : status === 'error' ? 'Erro na Confirmação' : 'Confirmando...'}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {status === 'pending' && (
          <p className="text-sm text-muted-foreground">Confirmando seu email...</p>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Seu email foi confirmado com sucesso. Agora você pode acessar sua conta.
            </p>
            <Button asChild className="mt-2">
              <Link to="/login">Ir para Login</Link>
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {errorMsg || 'Não foi possível confirmar seu email. O link pode ter expirado.'}
            </p>
            <Button variant="outline" asChild className="mt-2">
              <Link to="/login">Voltar para Login</Link>
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
