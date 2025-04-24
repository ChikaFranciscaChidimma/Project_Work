
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/useTheme";

const GeneralSettings = () => {
  const { theme, setTheme } = useTheme();
  
  return (
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
          <h4 className="font-medium">Theme</h4>
          <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
        </div>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
          className="px-3 py-2 rounded-md bg-background border border-input"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
      
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
  );
};

export default GeneralSettings;

