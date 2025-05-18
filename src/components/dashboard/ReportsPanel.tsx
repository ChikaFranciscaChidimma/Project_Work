
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ChartPie, 
  ChartBar, 
  FileBarChart, 
  CalendarDays,
  FileText 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

// Mock sales data for charts
const salesData = [
  { name: "Monday", sales: 4000, orders: 24 },
  { name: "Tuesday", sales: 3000, orders: 18 },
  { name: "Wednesday", sales: 5000, orders: 26 },
  { name: "Thursday", sales: 2780, orders: 15 },
  { name: "Friday", sales: 6890, orders: 35 },
  { name: "Saturday", sales: 8390, orders: 41 },
  { name: "Sunday", sales: 3490, orders: 20 },
];

// Mock branch comparison data
const branchData = [
  { name: "Main Store", sales: 24500, orders: 142, avgOrder: 172.53 },
  { name: "Downtown", sales: 18700, orders: 98, avgOrder: 190.81 },
  { name: "Mall Plaza", sales: 32400, orders: 185, avgOrder: 175.13 },
];

interface ReportsPanelProps {
  compact?: boolean;
}

const ReportsPanel = ({ compact = false }: ReportsPanelProps) => {
  const [reportType, setReportType] = useState("daily");
  const [chartView, setChartView] = useState("sales");

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Analytics and business performance reports</CardDescription>
        </div>
        
        {!compact && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!compact && (
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
            <Tabs defaultValue="daily" value={reportType} onValueChange={setReportType} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="daily">
                  <Calendar className="h-4 w-4 mr-2" />
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly">
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={chartView} onValueChange={setChartView}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">
                  <div className="flex items-center">
                    <ChartBar className="h-4 w-4 mr-2" />
                    Sales Amount
                  </div>
                </SelectItem>
                <SelectItem value="orders">
                  <div className="flex items-center">
                    <ChartPie className="h-4 w-4 mr-2" />
                    Order Count
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className={compact ? "h-[200px]" : "h-[300px]"}>
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "sales" ? (
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" name="Sales ($)" fill="#8884d8" />
              </BarChart>
            ) : (
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#82ca9d" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {!compact && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Branch Performance Comparison</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Avg. Order Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchData.map((branch) => (
                  <TableRow key={branch.name}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>${branch.sales.toLocaleString()}</TableCell>
                    <TableCell>{branch.orders}</TableCell>
                    <TableCell>${branch.avgOrder.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {compact && (
          <div className="mt-2 text-center">
            <Button variant="link" size="sm">View detailed reports</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Local Table components to avoid dependency on external component
const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&_tr]:border-b">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">{children}</tr>
);

const TableHead = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>
);

const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
);

export default ReportsPanel;
