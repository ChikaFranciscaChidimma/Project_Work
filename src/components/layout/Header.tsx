import { Bell, MessageCircle, User } from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(3);
  
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl text-primary">BranchSync</span>
        {user?.branchName && (
          <Badge variant="outline" className="ml-2 bg-secondary/10 text-secondary">
            {user.branchName}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-destructive-foreground text-xs flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-1">
                  <div className="font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-warning"></span>
                    Low Stock Alert
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Item #1284 (Wireless Keyboard) is running low on stock.
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-1">
                  <div className="font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success"></span>
                    Sales Milestone
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Daily sales target has been reached!
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-1">
                  <div className="font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    System Update
                  </div>
                  <div className="text-sm text-muted-foreground">
                    BranchSync will undergo maintenance tonight.
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">5 hours ago</div>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center font-medium text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Chat */}
        <Button variant="ghost" size="icon" className="relative">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-success rounded-full"></span>
        </Button>
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name || 'Admin'}</span>
                <span className="text-xs font-normal text-muted-foreground">admin@branchsync.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
