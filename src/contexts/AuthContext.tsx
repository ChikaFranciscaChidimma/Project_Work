import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "branch-manager" | "cashier";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Export the context for direct imports if needed
export { AuthContext };

// Mock users for demonstration (would be replaced with Supabase authentication)
const mockUsers: User[] = [
  {
    id: "1",
    name: "Chika",
    email: "chikafranciscachidimma@gmail.com",
    role: "admin"
  },
  {
    id: "2",
    name: "Branch 1 Manager",
    email: "manager@branchsync.com",
    role: "branch-manager",
    branchId: "1",
    branchName: "Branch 1"
  },
  {
    id: "3",
    name: "Branch 2 Manager",
    email: "manager2@branchsync.com",
    role: "branch-manager",
    branchId: "2",
    branchName: "Branch 2"
  },
  {
    id: "4",
    name: "Cashier",
    email: "cashier@branchsync.com",
    role: "cashier",
    branchId: "1",
    branchName: "Branch 1"
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Check if user data exists in localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("branchsync-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Set up Supabase auth listener (for future implementation)
  useEffect(() => {
    // This would be the place to setup Supabase auth listener
    // For now, we'll keep using the mock implementation
  }, []);

  // Mock login function - in a real app, this would use Supabase auth
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (simple mock authentication)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && password === "password") {
        setUser(foundUser);
        localStorage.setItem("branchsync-user", JSON.stringify(foundUser));
        
        // Log authentication for debugging
        console.log("User authenticated:", foundUser);
        
        return true;
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Would use supabase.auth.signOut() in a real implementation
    setUser(null);
    localStorage.removeItem("branchsync-user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
