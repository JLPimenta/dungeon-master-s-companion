import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullscreenLoader } from '@/components/brand/FullscreenLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const isGuestMode = import.meta.env.VITE_USE_API !== 'true';

  if (isGuestMode) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <FullscreenLoader label="Carregando..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
