
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import POS from "./pages/POS";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import { useAuth } from "./contexts/AuthContext";

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
  
  return <>{children}</>;
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

const queryClient = new QueryClient();

// Wrap the main app with necessary providers
const AppContent = () => (
  <BrowserRouter>
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
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
