
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock inventory data
const inventoryItems = [
  {
    id: 1,
    name: "Wireless Keyboard",
    currentStock: 5,
    lowStockThreshold: 10,
    totalStock: 50,
    status: "low", // low, optimal, overstocked
  },
  {
    id: 2,
    name: "HD Monitor 24\"",
    currentStock: 12,
    lowStockThreshold: 8,
    totalStock: 40,
    status: "optimal",
  },
  {
    id: 3,
    name: "Wireless Mouse",
    currentStock: 8,
    lowStockThreshold: 10,
    totalStock: 50,
    status: "low",
  },
  {
    id: 4,
    name: "USB-C Cable 1m",
    currentStock: 4,
    lowStockThreshold: 15,
    totalStock: 100,
    status: "low",
  },
  {
    id: 5,
    name: "Laptop Sleeve 15\"",
    currentStock: 25,
    lowStockThreshold: 10,
    totalStock: 50,
    status: "optimal",
  },
];

const calculateProgressColor = (status: string) => {
  switch (status) {
    case "low":
      return "bg-warning";
    case "optimal":
      return "bg-success";
    case "overstocked":
      return "bg-info";
    default:
      return "bg-primary";
  }
};

const InventoryStatus = () => {
  // Count low stock items
  const lowStockCount = inventoryItems.filter(
    (item) => item.status === "low"
  ).length;

  return (
    <Card className="col-span-5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Inventory Status</CardTitle>
          {lowStockCount > 0 && (
            <div className="text-sm font-medium text-warning flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              {lowStockCount} items low on stock
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {lowStockCount > 0 && (
          <Alert className="mb-4 bg-warning/10 border-warning/20 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some items are below the recommended stock levels. Consider restocking soon.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {inventoryItems.map((item) => {
            const stockPercentage = Math.round(
              (item.currentStock / item.totalStock) * 100
            );
            const progressColor = calculateProgressColor(item.status);

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium rounded-full px-2 py-0.5",
                        item.status === "low"
                          ? "bg-warning/20 text-warning"
                          : item.status === "optimal"
                          ? "bg-success/20 text-success"
                          : "bg-info/20 text-info"
                      )}
                    >
                      {item.currentStock} in stock
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={stockPercentage} 
                    className={cn("h-2", item.status === "low" ? "bg-warning/20" : "bg-success/20")}
                    style={{
                      "--progress-indicator-color": `hsl(var(--${item.status === "low" ? "warning" : "success"}))`
                    } as React.CSSProperties}
                  />
                  <span className="text-xs text-muted-foreground min-w-[40px]">{stockPercentage}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <button className="text-sm text-primary hover:underline">View All Inventory Items</button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryStatus;
