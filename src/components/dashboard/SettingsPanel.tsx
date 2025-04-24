
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Clock, Building, Database, CreditCard } from "lucide-react";
import GeneralSettings from "./settings/GeneralSettings";
import BusinessHours from "./settings/BusinessHours";
import PaymentSettings from "./settings/PaymentSettings";
import DataSyncSettings from "./settings/DataSyncSettings";

const SettingsPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          System Settings
        </CardTitle>
        <CardDescription>Configure preferences for the entire system</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-2" />
              Business Hours
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="sync">
              <Database className="h-4 w-4 mr-2" />
              Data Sync
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="hours">
            <BusinessHours />
          </TabsContent>
          
          <TabsContent value="payment">
            <PaymentSettings />
          </TabsContent>
          
          <TabsContent value="sync">
            <DataSyncSettings />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

export default SettingsPanel;

