// In a shared types file (e.g., types/notification.ts)
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  type: "warning" | "success" | "info" | "error";
  read: boolean;
  productId?: string;
  isMock?: boolean;
}

export interface NotificationEvent {
  notification: Notification;
}