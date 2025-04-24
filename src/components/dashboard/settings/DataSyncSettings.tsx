
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const DataSyncSettings = () => {
  return (
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
  );
};

export default DataSyncSettings;

