
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface CompletedOrder {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  paymentType: string;
  paymentTypeName: string;
  date: string;
  branchId: string;
  branchName: string;
  userId: string;
  userName: string;
  status: string;
}

interface CompletedOrdersPanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const CompletedOrdersPanel = ({ compact = false, branchFilter }: CompletedOrdersPanelProps) => {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Get all completed orders from localStorage
    const allOrders = JSON.parse(localStorage.getItem('completed-orders') || '[]');
    
    // Filter orders by branch if needed
    let filteredOrders = allOrders;
    if (branchFilter) {
      filteredOrders = allOrders.filter((order: CompletedOrder) => order.branchId === user.branchId);
    }
    
    // Filter only completed orders
    filteredOrders = filteredOrders.filter((order: CompletedOrder) => order.status === "Completed");
    
    // Sort by date (newest first)
    filteredOrders.sort((a: CompletedOrder, b: CompletedOrder) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setOrders(filteredOrders);
  }, [user, branchFilter]);
  
  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Completed Orders
        </CardTitle>
        <CardDescription>
          Successfully completed orders from your branch
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className={compact ? "max-h-[200px] overflow-y-auto" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.slice(0, compact ? 5 : undefined).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>{format(parseISO(order.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.paymentTypeName}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No completed orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedOrdersPanel;
