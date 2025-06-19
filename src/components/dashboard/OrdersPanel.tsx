import { useEffect, useState } from "react";
import { fetchCompletedOrders } from "../../../services/api";
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
import { Badge } from "@/components/ui/badge";

interface CompletedOrder {
  id: string;
  orderId: string;
  customer: string;
  branch: string;
  date: string;
  status: string;
  total: number;
  paymentMethod: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  staff: string;
}

interface OrdersPanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const BRANCHES = [
  { label: "All Branches", value: "all" },
  { label: "Branch 1", value: "Branch 1" },
  { label: "Branch 2", value: "Branch 2" }
];

const OrdersPanel = ({ compact = false, branchFilter }: OrdersPanelProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [branch, setBranch] = useState<string>(branchFilter || "all");
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders whenever branch changes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        // If branch is "all", don't send a branch param
        const data = await fetchCompletedOrders(branch !== "all" ? branch : undefined);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [branch]);

  // Filter orders based on selected date
  const filteredOrders = orders.filter(order => {
    if (order.status.toLowerCase() !== "completed") return false;
    if (date) {
      const orderDate = format(new Date(order.date), "yyyy-MM-dd");
      const selectedDate = format(date, "yyyy-MM-dd");
      if (orderDate !== selectedDate) return false;
    }
    return true;
  });

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Completed Orders
          </CardTitle>
          <CardDescription>
            {branch !== "all"
              ? `View completed sales orders for ${branch}` 
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
        {!compact && (
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
                  {BRANCHES.map(b => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
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
                <TableHead>Customer</TableHead>
                {branch === "all" && <TableHead>Branch</TableHead>}
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.slice(0, compact ? 3 : undefined).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    {branch === "all" && <TableCell>{order.branch}</TableCell>}
                    <TableCell>
                      {order.items.map((item, i) => (
                        <div key={i} className="text-sm">
                          {item.quantity}x {item.productName}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{format(new Date(order.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={branch === "all" ? 7 : 6} className="text-center py-8">
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