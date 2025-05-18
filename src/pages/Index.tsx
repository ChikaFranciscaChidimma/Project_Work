
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkSupabaseConnection } from '@/utils/api/utils';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Check Supabase connection on index page load
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  // Redirect to dashboard if authenticated, otherwise to login page
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
