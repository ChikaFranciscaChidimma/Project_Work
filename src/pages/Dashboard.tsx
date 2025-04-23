
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";
import OrdersPanel from "@/components/dashboard/OrdersPanel";
import InventoryPanel from "@/components/dashboard/InventoryPanel";
import ReportsPanel from "@/components/dashboard/ReportsPanel";
import StaffBranchesPanel from "@/components/dashboard/StaffBranchesPanel";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import { 
  ShoppingCart, 
  Box, 
  BarChart, 
  Users, 
  Settings 
} from "lucide-react";

const Dashboard = () => {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");

  // Define tab items with icons
  const tabItems = [
    { id: "overview", label: "Overview", icon: <BarChart className="h-4 w-4 mr-2" /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
    { id: "inventory", label: "Inventory", icon: <Box className="h-4 w-4 mr-2" /> },
    { id: "staff", label: "Staff & Branches", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="mb-8">
            {tabItems.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrdersPanel compact />
            <InventoryPanel compact />
          </div>
          <ReportsPanel compact />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrdersPanel />
        </TabsContent>
        
        <TabsContent value="inventory">
          <InventoryPanel />
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsPanel />
        </TabsContent>
        
        <TabsContent value="staff">
          <StaffBranchesPanel />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Dashboard;
