
import { useEffect } from "react";
import { Bell, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { fetchAlerts, subscribeToAlerts, Alert as AlertType } from "@/utils/supabaseApi";
import { format, formatDistance } from "date-fns";

const AlertsWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get branch ID if user is a branch manager
  const branchId = user?.role === 'branch-manager' ? Number(user.branchId) : undefined;
  
  // Use real-time data hook for alerts
  const { 
    data: alerts = [], 
    isLoading, 
    error 
  } = useRealtimeData<AlertType>([], () => fetchAlerts(branchId), subscribeToAlerts, [branchId]);

  // Show toast for new alerts
  useEffect(() => {
    const showNewAlertToast = (alert: AlertType) => {
      toast({
        title: alert.alert_type === 'warning' ? 'Warning Alert' : 'New Notification',
        description: alert.alert_message,
        variant: alert.alert_type === 'warning' ? 'destructive' : 'default',
      });
    };

    // Subscribe to real-time alerts to show toasts for new ones
    const channel = subscribeToAlerts((payload) => {
      if (payload.eventType === 'INSERT') {
        showNewAlertToast(payload.new);
      }
    }, branchId);

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [toast, branchId]);

  const formatAlertTime = (timestamp?: string) => {
    if (!timestamp) return "Unknown time";
    
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
          {alerts.filter(alert => !alert.is_read).length > 0 && (
            <Badge>{alerts.filter(alert => !alert.is_read).length} new</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No alerts to display</p>
          </div>
        ) : (
          <div>
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className="px-6 py-3 flex items-start gap-3 border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
              >
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full mt-1.5",
                    alert.alert_type === "warning" && "bg-warning",
                    alert.alert_type === "success" && "bg-success",
                    alert.alert_type === "info" && "bg-primary",
                    alert.alert_type === "error" && "bg-destructive"
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1)} Alert
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatAlertTime(alert.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.alert_message}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
