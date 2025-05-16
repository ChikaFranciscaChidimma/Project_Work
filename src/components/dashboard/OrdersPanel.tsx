
import { useState, useEffect } from "react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, FileText, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/utils/supabaseApi";

interface OrdersPanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const OrdersPanel = ({ compact = false, branchFilter }: OrdersPanelProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [branch, setBranch] = useState<string>(branchFilter || "all");
  
  // Convert branch name to ID for API calls if needed
  const branchId = branchFilter 
    ? (branchFilter === "Branch 1" ? 1 : branchFilter === "Branch 2" ? 2 : undefined)
    : (branch !== "all" ? (branch === "Branch 1" ? 1 : 2) : undefined);
  
  // Fetch orders data using React Query
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', branchId],
    queryFn: () => fetchOrders(branchId),
  });

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // Only show completed orders
    if (order.order_status !== "Completed") {
      return false;
    }
    
    // Apply date filter if selected
    let matchesDate = !date || format(new Date(order.created_at || ''), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    
    return matchesDate;
  });

  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Completed Orders
          </CardTitle>
          <CardDescription>
            {branchFilter 
              ? `View completed sales orders for ${branchFilter}` 
              : "View completed sales orders across all branches"
            }
          </CardDescription>
        </div>
        
        {!compact && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!compact && !branchFilter && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Filter by date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex-1">
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Branch 1">Branch 1</SelectItem>
                  <SelectItem value="Branch 2">Branch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className={compact ? "max-h-[200px] overflow-y-auto" : ""}>
          <Table>
            {!compact && <TableCaption>A list of your completed orders.</TableCaption>}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Product</TableHead>
                {!branchFilter && <TableHead>Branch</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={branchFilter ? 4 : 5} className="text-center py-4">
                    <p className="text-muted-foreground">Loading orders...</p>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.slice(0, compact ? 3 : undefined).map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>Order #{order.order_id}</TableCell>
                    {!branchFilter && <TableCell>{order.branchName || `Branch ${order.branch_id}`}</TableCell>}
                    <TableCell>{order.created_at ? format(new Date(order.created_at), "MMM d, yyyy") : 'N/A'}</TableCell>
                    <TableCell className="text-right">${order.total_amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={branchFilter ? 4 : 5} className="text-center py-8">
                    <p className="text-muted-foreground">No completed orders found.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Completed orders from the "Record Sale" action will appear here.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {compact && filteredOrders.length > 3 && (
            <div className="mt-2 text-center">
              <Button variant="link" size="sm">View all orders</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersPanel;
