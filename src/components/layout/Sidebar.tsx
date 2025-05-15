
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, 
  Box, 
  ClipboardList, 
  CreditCard, 
  Home,
  Settings, 
  ShoppingCart,
  Users
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === "admin";
  const isBranchManager = user?.role === "branch-manager";
  const isCashier = user?.role === "cashier";

  // Define navigation items with role-based access
  const navigation = [
    {
      name: "Dashboard",
      href: isAdmin ? "/dashboard" : "/manager-dashboard",
      icon: Home,
      allowedRoles: ["admin", "branch-manager", "cashier"],
    },
    {
      name: "Point of Sale",
      href: "/pos",
      icon: CreditCard,
      allowedRoles: ["admin", "branch-manager", "cashier"],
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Box,
      allowedRoles: ["admin", "branch-manager", "cashier"],
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
      allowedRoles: ["admin", "branch-manager", "cashier"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart,
      allowedRoles: ["admin", "branch-manager"],
    },
    {
      name: "Staff & Branches",
      href: "/management",
      icon: Users,
      allowedRoles: ["admin"],
    },
    {
      name: "Staff Attendance",
      href: "/attendance",
      icon: ClipboardList,
      allowedRoles: ["branch-manager"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      allowedRoles: ["admin", "branch-manager"],
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-border transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full py-4">
        <div className="flex flex-col px-2 flex-1 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            {navigation
              .filter(item => {
                if (!user) return false;
                return item.allowedRoles.includes(user.role);
              })
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </nav>
        </div>
        
        <div className="px-4 mt-auto">
          <div className="bg-sidebar-accent/30 rounded-md p-3 text-sidebar-foreground">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs font-medium mb-1 opacity-80">Logged in as:</p>
                <p className="text-sm font-medium capitalize">{user?.role.replace('-', ' ')}</p>
                {user?.branchName && (
                  <p className="text-xs text-muted-foreground mt-1">{user.branchName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
