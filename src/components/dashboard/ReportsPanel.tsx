
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesByBranchChart from "./SalesByBranchChart";

interface ReportsPanelProps {
  compact?: boolean;
}

const ReportsPanel = ({ compact = false }: ReportsPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports & Analytics</CardTitle>
        <CardDescription>
          View real-time analytics across all branches
        </CardDescription>
      </CardHeader>
      <CardContent>
        {compact ? (
          <SalesByBranchChart />
        ) : (
          <Tabs defaultValue="sales">
            <TabsList className="grid grid-cols-3 mb-8 w-[400px]">
              <TabsTrigger value="sales">Sales Reports</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="space-y-4">
              <SalesByBranchChart />
            </TabsContent>
            
            <TabsContent value="inventory">
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                <p className="text-muted-foreground">Inventory analytics coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="staff">
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                <p className="text-muted-foreground">Staff analytics coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsPanel;
