
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      toast({
        title: "Welcome back!",
        description: `You are logged in as ${user.name}`,
      });
    }
  }, [isAuthenticated, user, toast]);

  // Redirect to dashboard if authenticated, otherwise to login page
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
