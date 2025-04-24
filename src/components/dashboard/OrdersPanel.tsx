import { useState } from "react";
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
import { Calendar, ArrowDown, ArrowUp, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Update mock orders data
const mockOrders = [
  { id: "ORD-001", date: "2023-04-20", customer: "John Doe", total: "$156.99", branch: "Branch 1", status: "Completed" },
  { id: "ORD-002", date: "2023-04-21", customer: "Jane Smith", total: "$89.50", branch: "Branch 2", status: "Pending" },
  { id: "ORD-003", date: "2023-04-21", customer: "Bob Johnson", total: "$234.75", branch: "Branch 1", status: "Completed" },
  { id: "ORD-004", date: "2023-04-22", customer: "Alice Brown", total: "$45.25", branch: "Branch 2", status: "Cancelled" },
  { id: "ORD-005", date: "2023-04-23", customer: "Mike Williams", total: "$124.00", branch: "Branch 1", status: "Pending" },
];

interface OrdersPanelProps {
  compact?: boolean;
}

const OrdersPanel = ({ compact = false }: OrdersPanelProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [branch, setBranch] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  // Filter orders based on selected filters
  const filteredOrders = mockOrders.filter(order => {
    let matchesBranch = branch === "all" || order.branch === branch;
    let matchesStatus = status === "all" || order.status === status;
    let matchesDate = !date || order.date === format(date, "yyyy-MM-dd");
    
    return matchesBranch && matchesStatus && matchesDate;
  });

  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Orders</CardTitle>
          <CardDescription>View and manage all sales orders across branches</CardDescription>
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
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Branch 1">Branch 1</SelectItem>
                  <SelectItem value="Branch 2">Branch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className={compact ? "max-h-[200px] overflow-y-auto" : ""}>
          <Table>
            {!compact && <TableCaption>A list of your recent orders.</TableCaption>}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.slice(0, compact ? 3 : undefined).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.branch}</TableCell>
                  <TableCell>
                    <span 
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        order.status === "Completed" ? "bg-green-100 text-green-800" : 
                        order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      )}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{order.total}</TableCell>
                </TableRow>
              ))}
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
