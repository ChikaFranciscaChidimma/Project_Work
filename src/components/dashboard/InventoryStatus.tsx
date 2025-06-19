import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchInventory } from "../../../services/api";

// Helper to determine status for progress color and badge
const getStatus = (stock: number, minStock: number) => {
  if (stock === 0) return "low";
  if (stock <= minStock) return "low";
  if (stock > minStock && stock <= minStock * 2) return "optimal";
  return "overstocked";
};

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

interface InventoryStatusItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  branch: string;
  price: number;
  status: "low" | "optimal" | "overstocked";
  totalStock: number; // For progress bar, you may define this as max(stock, minStock*2) or a static value
}

const InventoryStatus = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryStatusItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const loadInventory = async () => {
    try {
      console.log('Starting inventory fetch...'); // Debug
      setLoading(true);
      setError(null);
      const items = await fetchInventory();
      console.log('Received items:', items); // Debug
      
      if (!items || items.length === 0) {
        console.warn('Received empty items array'); // Debug
      }

      const mapped: InventoryStatusItem[] = items.map((item: any) => {
        const totalStock = Math.max(item.stock, item.minStock * 2, 10);
        const status = getStatus(item.stock, item.minStock);
        return {
          id: item.id || item._id,
          name: item.name,
          stock: item.stock,
          minStock: item.minStock,
          branch: item.branch,
          price: item.price,
          status,
          totalStock,
        };
      });
      
      console.log('Mapped inventory items:', mapped); // Debug
      setInventoryItems(mapped);
    } catch (err: any) {
      console.error('Inventory fetch error:', err); // Debug
      setError(err.message || "Failed to load inventory status.");
    } finally {
      console.log('Inventory fetch completed'); // Debug
      setLoading(false);
    }
  };
  loadInventory();
}, []);

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
        {error && (
          <Alert className="mb-4 bg-destructive/10 border-destructive/20 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="py-4 text-muted-foreground">
            Loading inventory status...
          </div>
        ) : (
          <>
            {lowStockCount > 0 && (
              <Alert className="mb-4 bg-warning/10 border-warning/20 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some items are below the recommended stock levels. Consider
                  restocking soon.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {inventoryItems.map((item) => {
                const stockPercentage = item.totalStock
                  ? Math.round((item.stock / item.totalStock) * 100)
                  : 0;
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-medium rounded-full px-2 py-0.5",
                            calculateProgressColor(item.status) +
                              "/20 text-" +
                              (item.status === "low"
                                ? "warning"
                                : item.status === "optimal"
                                ? "success"
                                : "info")
                          )}
                        >
                          {item.stock} in stock
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          Min: {item.minStock}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={stockPercentage}
                        className={cn(
                          "h-2",
                          calculateProgressColor(item.status)
                        )}
                        style={
                          {
                            "--progress-indicator-color": `hsl(var(--${
                              item.status === "low"
                                ? "warning"
                                : item.status === "optimal"
                                ? "success"
                                : "info"
                            }))`,
                          } as React.CSSProperties
                        }
                      />
                      <span className="text-xs text-muted-foreground min-w-[40px]">
                        {stockPercentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <button className="text-sm text-primary hover:underline">
                View All Inventory Items
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStatus;
