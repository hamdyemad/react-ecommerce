import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GlassyLoader } from './GlassyLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {loading && <GlassyLoader />}
      {isAuthenticated ? children : null}
    </>
  );
}
