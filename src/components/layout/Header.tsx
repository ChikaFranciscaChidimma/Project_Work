// src/layout/Header.tsx
import { Bell, MessageCircle, User } from "lucide-react";
import { socketService } from "../../../services/socketService";
import { ThemeToggle } from "../ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { useState, useEffect } from "react";
import { notificationService } from "../../../services/notificationService";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  type: "warning" | "success" | "info" | "error";
  read: boolean;
  productId?: string;
  isMock?: boolean;
}

// Mock notifications that you want to keep
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "mock-sales",
    title: "Sales Milestone",
    message: "Daily sales target has been reached!",
    time: new Date(Date.now() - 3600000), // 1 hour ago
    type: "success",
    read: false,
    isMock: true,
  },
  {
    id: "mock-system",
    title: "System Update",
    message: "BranchSync will undergo maintenance tonight.",
    time: new Date(Date.now() - 18000000), // 5 hours ago
    type: "info",
    read: false,
    isMock: true,
  },
];

const Header = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

 useEffect(() => {
  // Initialize with both service notifications and mock notifications
  const initialNotifications = [
    ...notificationService.getNotifications(),
    ...MOCK_NOTIFICATIONS
  ];
  setNotifications(initialNotifications);
  setUnreadCount(notificationService.getNotifications().filter(n => !n.read).length);

  // Socket.IO listener for real-time notifications
  const handleRealTimeNotification = (data: { notification: Notification }) => {
    const newNotification = {
      ...data.notification,
      time: new Date(data.notification.time),
      read: false
    };
    
    // Add to notification service
    notificationService.addRealTimeNotification(newNotification);
    
    // Update state
    setNotifications(prev => [
      newNotification,
      ...prev.filter(n => !n.isMock) // Keep only real notifications
    ]);
    setUnreadCount(prev => prev + 1);
  };

  // Notification service subscription
  const unsubscribe = notificationService.subscribe((serviceNotifications) => {
    const allNotifications = [
      ...serviceNotifications,
      ...MOCK_NOTIFICATIONS
    ];
    setNotifications(allNotifications);
    setUnreadCount(serviceNotifications.filter(n => !n.read).length);
  });

  socketService.subscribe("new-notification", handleRealTimeNotification);

  return () => {
    socketService.unsubscribe("new-notification"); 
    unsubscribe();
  };
}, []);

  const markAsRead = (id: string) => {
    // Only mark real notifications as read
    if (!MOCK_NOTIFICATIONS.some((mock) => mock.id === id)) {
      notificationService.markAsRead(id);
    }
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.productId) {
      navigate(`/inventory?highlight=${notification.productId}`);
    }
  };

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl text-primary">BranchSync</span>
        {user?.branchName && (
          <Badge
            variant="outline"
            className="ml-2 bg-secondary/10 text-secondary"
          >
            {user.branchName}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-destructive-foreground text-xs flex items-center justify-center rounded-full">
                 {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "py-3",
                      !notification.read &&
                        !notification.isMock &&
                        "bg-accent/50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="font-medium flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            notification.type === "warning" && "bg-warning",
                            notification.type === "error" && "bg-destructive",
                            notification.type === "success" && "bg-success",
                            notification.type === "info" && "bg-primary"
                          )}
                        ></span>
                        {notification.title}
                        {notification.isMock && (
                          <Badge variant="outline" className="text-xs">
                            Sample
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {notification.time.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center font-medium text-primary"
              onClick={() => {
                markAllAsRead();
                navigate('/notifications', { replace: true }); 
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-8 w-8 p-0"
            >
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
                <span>{user?.name || "User"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
