
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchSalesByBranch } from "@/utils/supabaseApi";
import { useToast } from "@/hooks/use-toast";

interface SalesByBranchChartProps {
  className?: string;
}

const SalesByBranchChart = ({ className }: SalesByBranchChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const salesData = await fetchSalesByBranch();
        if (isMounted) {
          setData(salesData);
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Error loading sales data",
            description: "Could not fetch sales by branch data.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Set up polling for updates every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [toast]);
  
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sales by Branch</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Loading sales data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No sales data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="branch_name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Total Sales"]}
                  labelFormatter={(label) => `Branch: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="total_sales" 
                  name="Total Sales" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesByBranchChart;
