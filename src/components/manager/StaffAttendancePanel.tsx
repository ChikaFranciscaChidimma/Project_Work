
import { useState, useEffect } from "react";
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

interface AttendanceRecord {
  id: string;
  userId: string;
  name: string;
  role: string;
  branch: string;
  status: string;
  timeIn: string;
  timeOut: string;
  date: string;
  duration: string;
}

interface StaffAttendancePanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const StaffAttendancePanel = ({ compact = false, branchFilter }: StaffAttendancePanelProps) => {
  const [date] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  useEffect(() => {
    // Load attendance records from localStorage
    const loadedRecords = JSON.parse(localStorage.getItem('staff-attendance') || '[]');
    
    // Filter by branch if needed
    const filteredRecords = branchFilter
      ? loadedRecords.filter((record: AttendanceRecord) => record.branch === branchFilter)
      : loadedRecords;
    
    setAttendanceRecords(filteredRecords);
  }, [branchFilter]);
  
  // Summary statistics
  const totalStaff = attendanceRecords.length;
  const presentStaff = attendanceRecords.filter(staff => staff.status === "Present").length;
  const lateStaff = attendanceRecords.filter(staff => staff.status === "Late").length;
  const absentStaff = attendanceRecords.filter(staff => staff.status === "Absent").length;
  
  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Staff Attendance
          </CardTitle>
          <CardDescription>
            Attendance for {branchFilter || "all branches"} - Generated from Clock In/Out
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
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.slice(0, compact ? 3 : undefined).map((staff) => (
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
                    <TableCell>{staff.duration || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No attendance records found. Records are generated when staff clock in and out.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {compact && attendanceRecords.length > 3 && (
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
