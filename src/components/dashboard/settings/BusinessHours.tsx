
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BusinessHours = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branch 1</CardTitle>
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
            <CardTitle className="text-base">Branch 2</CardTitle>
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
  );
};

export default BusinessHours;

