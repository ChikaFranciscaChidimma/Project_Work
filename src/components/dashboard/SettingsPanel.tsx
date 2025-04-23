
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Clock, Building, Database, CreditCard } from "lucide-react";

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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input id="business-name" defaultValue="BranchSync Solutions Inc." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" defaultValue="admin@branchsync.com" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                </div>
                <Switch id="dark-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive email alerts for critical events</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto Backup</h4>
                  <p className="text-sm text-muted-foreground">Automatically backup data every 24 hours</p>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hours">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Main Store</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span>{day}</span>
                          <div className="flex items-center space-x-2">
                            <Input className="w-24" defaultValue="09:00" />
                            <span>to</span>
                            <Input className="w-24" defaultValue="18:00" />
                          </div>
                        </div>
                      ))}
                      {["Saturday", "Sunday"].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span>{day}</span>
                          <div className="flex items-center space-x-2">
                            <Input className="w-24" defaultValue="10:00" />
                            <span>to</span>
                            <Input className="w-24" defaultValue="16:00" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Downtown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span>{day}</span>
                          <div className="flex items-center space-x-2">
                            <Input className="w-24" defaultValue="09:00" />
                            <span>to</span>
                            <Input className="w-24" defaultValue="18:00" />
                          </div>
                        </div>
                      ))}
                      {["Saturday", "Sunday"].map((day) => (
                        <div key={day} className="flex items-center justify-between">
                          <span>{day}</span>
                          <div className="flex items-center space-x-2">
                            <Input className="w-24" defaultValue="10:00" />
                            <span>to</span>
                            <Input className="w-24" defaultValue="16:00" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payment">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Credit Card Payments</h4>
                  <p className="text-sm text-muted-foreground">Accept credit card payments</p>
                </div>
                <Switch id="credit-card" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mobile Payments</h4>
                  <p className="text-sm text-muted-foreground">Accept mobile wallet payments</p>
                </div>
                <Switch id="mobile-payments" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Blockchain Payments</h4>
                  <p className="text-sm text-muted-foreground">Accept cryptocurrency payments via blockchain</p>
                </div>
                <Switch id="blockchain-payments" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="payment-api-key">Payment API Key</Label>
                <Input id="payment-api-key" type="password" value="••••••••••••••••" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-webhook">Payment Webhook URL</Label>
                <Input id="payment-webhook" defaultValue="https://branchsync.com/api/payments/webhook" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sync">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                <Input id="sync-interval" type="number" defaultValue="15" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Offline Mode</h4>
                  <p className="text-sm text-muted-foreground">Allow operations when internet connection is lost</p>
                </div>
                <Switch id="offline-mode" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">ODK Integration</h4>
                  <p className="text-sm text-muted-foreground">Sync with ODK for offline data collection</p>
                </div>
                <Switch id="odk-integration" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Background Sync</h4>
                  <p className="text-sm text-muted-foreground">Sync data in the background</p>
                </div>
                <Switch id="background-sync" defaultChecked />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="odk-endpoint">ODK Endpoint URL</Label>
                <Input id="odk-endpoint" defaultValue="https://odk-central.example.com" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="odk-username">ODK Username</Label>
                  <Input id="odk-username" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="odk-password">ODK Password</Label>
                  <Input id="odk-password" type="password" />
                </div>
              </div>
            </div>
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
