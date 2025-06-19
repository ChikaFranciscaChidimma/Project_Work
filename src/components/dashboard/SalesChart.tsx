
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { fetchSalesData } from "../../../services/api.js";

// Mock data for the sales chart
const data = [
  {
    name: "Mon",
    Total: 4200,
    OnlineOrders: 1800,
    InStoreOrders: 2400,
  },
  {
    name: "Tue",
    Total: 3800,
    OnlineOrders: 1600,
    InStoreOrders: 2200,
  },
  {
    name: "Wed",
    Total: 5000,
    OnlineOrders: 2200,
    InStoreOrders: 2800,
  },
  {
    name: "Thu",
    Total: 4800,
    OnlineOrders: 2100,
    InStoreOrders: 2700,
  },
  {
    name: "Fri",
    Total: 6000,
    OnlineOrders: 2700,
    InStoreOrders: 3300,
  },
  {
    name: "Sat",
    Total: 6800,
    OnlineOrders: 3200,
    InStoreOrders: 3600,
  },
  {
    name: "Sun",
    Total: 4900,
    OnlineOrders: 2300,
    InStoreOrders: 2600,
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-md shadow-md p-3">
        <p className="font-medium text-sm">{`${label}`}</p>
        <p className="text-sm text-primary mt-1">
          {`Total: $${payload[0].value?.toLocaleString()}`}
        </p>
        <p className="text-sm text-secondary mt-1">
          {`Online: $${payload[1].value?.toLocaleString()}`}
        </p>
        <p className="text-sm text-accent mt-1">
          {`In-Store: $${payload[2].value?.toLocaleString()}`}
        </p>
      </div>
    );
  }

  return null;
};

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const loadSalesData = async () => {
      try {
        const data = await fetchSalesData('weekly');
        setSalesData(data);
      } catch (error) {
        console.error("Error loading sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, []);

  if (loading) return <div>Loading sales data...</div>;

  return (
    <Card className="col-span-7">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Sales Overview</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-secondary" />
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">In-Store</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="Total"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                className="opacity-40"
                barSize={20}
              />
              <Bar
                dataKey="OnlineOrders"
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="InStoreOrders"
                fill="hsl(var(--accent))"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
