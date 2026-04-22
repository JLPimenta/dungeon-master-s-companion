import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const { confirmEmail, resendConfirmationEmail } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    token ? 'pending' : 'success'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Read the email passed via navigation state (from Register page)
  const emailFromState = (location.state as { email?: string } | null)?.email;

  useEffect(() => {
    if (!token) return;
    confirmEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setErrorMsg(err.message);
      });
  }, [token]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!emailFromState || resending || resendCooldown > 0) return;
    setResending(true);
    try {
      await resendConfirmationEmail(emailFromState);
      toast({ title: 'Email reenviado!', description: 'Verifique sua caixa de entrada e spam.' });
      setResendCooldown(60); // 60s cooldown
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setResending(false);
    }
  };

  if (!token) {
    // Shown after registration — no token yet
    return (
      <AuthLayout title="Verifique seu Email" subtitle="Quase lá!">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mail className="h-12 w-12 text-primary" />
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para{' '}
            {emailFromState ? (
              <strong className="text-foreground">{emailFromState}</strong>
            ) : (
              'o seu email'
            )}
            . Verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          <p className="text-xs text-muted-foreground/70">
            💡 Não encontrou? Verifique a pasta de <strong>spam</strong> ou <strong>lixo eletrônico</strong>.
          </p>

          {emailFromState && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending
                ? 'Reenviando...'
                : resendCooldown > 0
                  ? `Reenviar em ${resendCooldown}s`
                  : 'Reenviar email de confirmação'}
            </Button>
          )}

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
