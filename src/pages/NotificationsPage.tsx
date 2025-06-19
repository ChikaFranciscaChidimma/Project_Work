// src/pages/NotificationsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types/notification'; 
import { format } from 'date-fns';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial notifications
    const loadNotifications = () => {
      // Get both real and mock notifications
      const realNotifications = notificationService.getNotifications();
      const allNotifications = [...realNotifications];
      setNotifications(allNotifications);
    };

    loadNotifications();

    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications([...updatedNotifications]);
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = (productId?: string) => {
    if (productId) {
      navigate(`/inventory?highlight=${productId}`);
    }
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Notifications</h1>
        <button 
          onClick={() => notificationService.markAllAsRead()}
          className="text-sm text-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notifications available
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-accent/30' : ''
              }`}
              onClick={() => {
                notificationService.markAsRead(notification.id);
                handleNotificationClick(notification.productId);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    notification.type === 'error' ? 'bg-destructive' :
                    notification.type === 'warning' ? 'bg-warning' :
                    notification.type === 'success' ? 'bg-success' : 'bg-primary'
                  }`} />
                  <h3 className="font-medium">{notification.title}</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(notification.time).toLocaleString()}
                </span>
              </div>
              <p className="text-sm mt-1">{notification.message}</p>
              {notification.productId && (
                <p className="text-xs mt-2 text-primary">
                  Related to product ID: {notification.productId}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;