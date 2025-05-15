
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock attendance data
const mockAttendance = [
  { id: 1, name: "Jane Smith", role: "Sales Associate", branch: "Branch 1", status: "Present", timeIn: "08:30 AM", timeOut: "05:30 PM" },
  { id: 2, name: "Michael Johnson", role: "Cashier", branch: "Branch 1", status: "Present", timeIn: "08:45 AM", timeOut: "05:15 PM" },
  { id: 3, name: "Emily Wilson", role: "Sales Associate", branch: "Branch 1", status: "Late", timeIn: "09:30 AM", timeOut: "05:30 PM" },
  { id: 4, name: "Robert Brown", role: "Stock Clerk", branch: "Branch 1", status: "Absent", timeIn: "-", timeOut: "-" },
  { id: 5, name: "David Clark", role: "Cashier", branch: "Branch 2", status: "Present", timeIn: "08:30 AM", timeOut: "05:30 PM" },
  { id: 6, name: "Sarah Miller", role: "Sales Associate", branch: "Branch 2", status: "Present", timeIn: "08:15 AM", timeOut: "05:00 PM" },
  { id: 7, name: "James Taylor", role: "Stock Clerk", branch: "Branch 2", status: "Absent", timeIn: "-", timeOut: "-" },
  { id: 8, name: "Linda Davis", role: "Cashier", branch: "Branch 2", status: "Late", timeIn: "09:15 AM", timeOut: "05:30 PM" },
];

interface StaffAttendancePanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const StaffAttendancePanel = ({ compact = false, branchFilter }: StaffAttendancePanelProps) => {
  const [date] = useState<Date>(new Date());
  
  // Filter attendance by branch if branchFilter is provided
  const filteredAttendance = branchFilter
    ? mockAttendance.filter(staff => staff.branch === branchFilter)
    : mockAttendance;
  
  const totalStaff = filteredAttendance.length;
  const presentStaff = filteredAttendance.filter(staff => staff.status === "Present").length;
  const lateStaff = filteredAttendance.filter(staff => staff.status === "Late").length;
  const absentStaff = filteredAttendance.filter(staff => staff.status === "Absent").length;
  
  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Staff Attendance
          </CardTitle>
          <CardDescription>
            Manage attendance for {branchFilter || "all branches"}
          </CardDescription>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Today: </span>
          {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalStaff}</div>
              <p className="text-muted-foreground text-sm">Total Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{presentStaff}</div>
              <p className="text-muted-foreground text-sm">Present</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">{lateStaff}</div>
              <p className="text-muted-foreground text-sm">Late</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{absentStaff}</div>
              <p className="text-muted-foreground text-sm">Absent</p>
            </CardContent>
          </Card>
        </div>
        
        <div className={compact ? "max-h-[200px] overflow-y-auto" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.slice(0, compact ? 3 : undefined).map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>
                    <Badge variant={
                      staff.status === "Present" 
                        ? "default"
                        : staff.status === "Late" 
                          ? "secondary" 
                          : "destructive"
                    }>
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{staff.timeIn}</TableCell>
                  <TableCell>{staff.timeOut}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {compact && filteredAttendance.length > 3 && (
            <div className="mt-2 text-center">
              <Button variant="link" size="sm">View all staff</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffAttendancePanel;
