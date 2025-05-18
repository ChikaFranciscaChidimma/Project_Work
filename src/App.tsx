
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import POS from "./pages/POS";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect } from "react";
import { checkSupabaseConnection } from "./utils/api/utils";

// Role-based route protection component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = ["admin", "branch-manager", "cashier"] 
}: { 
  children: React.ReactNode,
  allowedRoles?: string[]
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }
  
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

// Route redirection based on user role
const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (user?.role === "branch-manager") {
    return <Navigate to="/manager-dashboard" replace />;
  }
  
  // Default case - cashier goes to POS
  return <Navigate to="/pos" replace />;
};

const App = () => {
  // Check Supabase connection on app start
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Manager Routes */}
        <Route path="/manager-dashboard" element={
          <ProtectedRoute allowedRoles={["branch-manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        
        {/* Shared Routes */}
        <Route path="/pos" element={
          <ProtectedRoute>
            <POS />
          </ProtectedRoute>
        } />
        
        {/* 404 Handler */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  );
};

export default App;
