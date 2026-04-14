import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GlassyLoader } from './GlassyLoader';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {loading && <GlassyLoader />}
      {children}
    </>
  );
}
