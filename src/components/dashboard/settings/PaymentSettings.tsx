
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const PaymentSettings = () => {
  return (
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
  );
};

export default PaymentSettings;

