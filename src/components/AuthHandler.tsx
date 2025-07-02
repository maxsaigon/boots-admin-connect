import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthHandlerProps {
  children: React.ReactNode;
}

export const AuthHandler = ({ children }: AuthHandlerProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      // If no user, redirect to auth
      if (!user) {
        navigate('/auth');
        return;
      }

      // If user is banned, redirect to auth
      if (profile?.is_banned) {
        navigate('/auth');
        return;
      }

      // If trying to access admin routes without admin role
      if (location.pathname.startsWith('/admin') && profile?.role !== 'admin') {
        navigate('/auth');
        return;
      }
    }
  }, [user, profile, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.is_banned) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};