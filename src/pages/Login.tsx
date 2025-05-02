
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-primary mb-2">BranchSync</h1>
        <p className="text-muted-foreground">Business Monitoring & Sales Management System</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© 2024 BranchSync. All rights reserved.</p>
        <p className="mt-1">Secure, Real-time Business Management</p>
      </div>
    </div>
  );
};

export default Login;
