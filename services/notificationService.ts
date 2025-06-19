
import { InventoryItem } from "../types/inventory";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  type: "warning" | "success" | "info" | "error";
  read: boolean;
  productId?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "mock-sales",
    title: "Sales Milestone",
    message: "Daily sales target has been reached!",
    time: new Date(Date.now() - 3600000),
    type: "success",
    read: false,
  },
  {
    id: "mock-system",
    title: "System Update",
    message: "BranchSync will undergo maintenance tonight.",
    time: new Date(Date.now() - 18000000),
    type: "info",
    read: false,
  },
];

class NotificationService {
  private notifications: Notification[] = [];
  private subscribers: ((notifications: Notification[]) => void)[] = [];

  addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>) {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date(),
      read: false
    };
    this.notifications = [newNotification, ...this.notifications].slice(0, 50);
    this.notifySubscribers();
  }

   addRealTimeNotification(notification: Notification) {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      time: new Date(notification.time),
      read: false
    };
    this.notifications = [newNotification, ...this.notifications].slice(0, 50);
    this.notifySubscribers();
  }
  

  // Get all notifications (for notifications page)
  async getAll(): Promise<Notification[]> {
    // If you need to fetch from backend:
    // const response = await fetch('/api/notifications');
    // return await response.json();
    
    // For now, just return local notifications
    return [...this.notifications];
  }


  markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifySubscribers();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notifySubscribers();
  }

   getNotifications(): Notification[] {
    return [...this.notifications]; // Only return real notifications
  }

   // For the page to get all notifications
  getAllNotifications(): Notification[] {
    return [...this.notifications, ...MOCK_NOTIFICATIONS];
  }

 subscribe(callback: (notifications: Notification[]) => void) {
    // Initial callback with current notifications
    callback([...this.notifications]);
    
    // Add to subscribers
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.notifications]));
  }
}

export const notificationService = new NotificationService();

// Helper to create stock alerts
export const createStockAlert = (item: InventoryItem, prevStock: number) => {
  if (item.stock === 0 && prevStock > 0) {
    notificationService.addNotification({
      title: "Out of Stock",
      message: `${item.name} is now out of stock`,
      type: "error"
    });
  } else if (item.stock <= item.minStock && prevStock > item.minStock) {
    notificationService.addNotification({
      title: "Low Stock Alert",
      message: `${item.name} is low on stock (${item.stock} remaining)`,
      type: "warning"
    });
  }
};