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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            BranchSync
          </span>
          {user?.branchName && (
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              {user.branchName}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs flex items-center justify-center rounded-full">
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
          
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-success rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 transition-transform hover:scale-105">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{user?.name || 'User'}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="text-destructive focus:text-destructive"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
