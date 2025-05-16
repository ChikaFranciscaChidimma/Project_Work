
import { useState } from "react";
import { Navigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import InventoryPanel from "@/components/dashboard/InventoryPanel";
import StaffAttendancePanel from "@/components/manager/StaffAttendancePanel";
import ShiftAttendanceCard from "@/components/manager/ShiftAttendanceCard";
import SalesRecordCard from "@/components/manager/SalesRecordCard";
import MyShiftAttendancePanel from "@/components/manager/MyShiftAttendancePanel";
import OrdersPanel from "@/components/dashboard/OrdersPanel";
import { 
  ShoppingCart, 
  Box,
  Users,
  Clock,
  Package,
  Check
} from "lucide-react";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // If user is not a branch manager, redirect to appropriate dashboard
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === "admin") {
    return <Navigate to="/dashboard" />;
  }
  
  if (user.role !== "branch-manager") {
    return <Navigate to="/access-denied" />;
  }

  // Define tab items with icons for manager
  const tabItems = [
    { id: "overview", label: "Overview", icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
    { id: "inventory", label: "Inventory", icon: <Box className="h-4 w-4 mr-2" /> },
    { id: "staff", label: "Staff Attendance", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "orders", label: "Completed Orders", icon: <Check className="h-4 w-4 mr-2" /> },
    { id: "record", label: "Record Sales", icon: <Package className="h-4 w-4 mr-2" /> },
    { id: "attendance", label: "My Shift", icon: <Clock className="h-4 w-4 mr-2" /> }
  ];

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Branch Manager Dashboard - {user.branchName}</h1>
      
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
            <OrdersPanel compact branchFilter={user.branchName} />
            <InventoryPanel compact branchFilter={user.branchName} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StaffAttendancePanel compact branchFilter={user.branchName} />
            <MyShiftAttendancePanel compact />
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <InventoryPanel branchFilter={user.branchName} />
        </TabsContent>
        
        <TabsContent value="staff">
          <StaffAttendancePanel branchFilter={user.branchName} />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersPanel branchFilter={user.branchName} />
        </TabsContent>

        <TabsContent value="record">
          <div className="max-w-xl mx-auto">
            <SalesRecordCard />
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <ShiftAttendanceCard />
            <MyShiftAttendancePanel />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default ManagerDashboard;
