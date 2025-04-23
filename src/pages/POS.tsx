
import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import POSLayout from "@/components/pos/POSLayout";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  ShoppingCart, 
  Box, 
  Users, 
  Settings, 
  DollarSign 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const POS = () => {
  const [activeView, setActiveView] = useState<string>("pos");
  
  const navigationItems = [
    { id: "pos", label: "Point of Sale", icon: <CreditCard className="h-5 w-5" /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart className="h-5 w-5" /> },
    { id: "inventory", label: "Inventory", icon: <Box className="h-5 w-5" /> },
    { id: "staff", label: "Staff", icon: <Users className="h-5 w-5" /> },
    { id: "reports", label: "Reports", icon: <DollarSign className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
  ];
  
  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        
        <div className="flex overflow-x-auto py-1 md:ml-auto">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              size="sm"
              className="mr-2 flex items-center"
              onClick={() => setActiveView(item.id)}
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {activeView === "pos" ? (
        <POSLayout />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">
              {navigationItems.find(item => item.id === activeView)?.label} Module
            </h3>
            <p className="text-muted-foreground">
              This module is currently under development.
              Please check back later or navigate to the admin dashboard for full functionality.
            </p>
            <Button className="mt-4" onClick={() => setActiveView("pos")}>
              Return to POS
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
};

export default POS;
