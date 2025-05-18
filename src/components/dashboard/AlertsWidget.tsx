
import { Bell, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

// Mock alerts data
const alerts = [
  {
    id: 1,
    title: "Low Stock Alert",
    message: "Wireless Keyboard is running low on stock (5 items remaining)",
    time: "10 minutes ago",
    type: "warning",
  },
  {
    id: 2,
    title: "Sales Milestone",
    message: "Daily sales target of $5,000 has been achieved!",
    time: "1 hour ago",
    type: "success",
  },
  {
    id: 3,
    title: "New Order (#ORD-7821)",
    message: "New online order received for 12 items ($1,450)",
    time: "2 hours ago",
    type: "info",
  },
  {
    id: 4,
    title: "Payment Failed",
    message: "Payment for order #ORD-7819 has failed. Action required.",
    time: "3 hours ago",
    type: "error",
  },
  {
    id: 5,
    title: "System Update",
    message: "BranchSync will undergo scheduled maintenance tonight",
    time: "5 hours ago",
    type: "info",
  },
];

const AlertsWidget = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
          <Badge>5 new</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="px-6 py-3 flex items-start gap-3 border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
            >
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full mt-1.5",
                  alert.type === "warning" && "bg-warning",
                  alert.type === "success" && "bg-success",
                  alert.type === "info" && "bg-primary",
                  alert.type === "error" && "bg-destructive"
                )}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
