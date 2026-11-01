import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  dialogCancel, dialogConfirm, dialogContent, dialogDescription, dialogFooter, dialogTitle,
} from '@/components/account/ui';

interface LogoutDialogProps {
  children: React.ReactNode;
}

export function LogoutDialog({ children }: LogoutDialogProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    navigate('/login');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className={cn(dialogContent, 'max-w-[420px]')}>
        <AlertDialogHeader className="space-y-0 text-left">
          <AlertDialogTitle className={dialogTitle}>Sair da conta?</AlertDialogTitle>
          <AlertDialogDescription className={dialogDescription}>
            Você será redirecionado para a página de login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={dialogFooter}>
          <AlertDialogCancel disabled={loading} className={dialogCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={loading}
            className={cn(dialogConfirm, 'px-5')}
          >
            {loading ? 'Saindo...' : 'Sair'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
