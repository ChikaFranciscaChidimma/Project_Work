
import React, { useState, useEffect } from "react";
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
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ShiftRecord {
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;
  startTime: string;
  endTime: string | null;
  duration: string;
  deviceInfo: string;
  locationInfo: string;
  date: string;
}

interface MyShiftAttendancePanelProps {
  compact?: boolean;
}

const MyShiftAttendancePanel = ({ compact = false }: MyShiftAttendancePanelProps) => {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Load all shift records from localStorage
    const allShifts = JSON.parse(localStorage.getItem('shift-records') || '[]');
    
    // Get current week boundaries
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    
    // Filter shifts for current user and current week
    const userWeekShifts = allShifts.filter((shift: ShiftRecord) => {
      if (shift.userId !== user.id) return false;
      
      const shiftDate = parseISO(shift.startTime);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    });
    
    // Sort by date (newest first)
    userWeekShifts.sort((a: ShiftRecord, b: ShiftRecord) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
    
    setShifts(userWeekShifts);
  }, [user]);
  
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    return format(parseISO(timeString), "h:mm a");
  };
  
  const weekRange = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
  };
  
  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center text-xl">
            <Clock className="h-5 w-5 mr-2" />
            My Shift Attendance
          </CardTitle>
          <CardDescription>
            Current week: {weekRange()}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={compact ? "max-h-[200px] overflow-y-auto" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock-In</TableHead>
                <TableHead>Clock-Out</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.length > 0 ? (
                shifts.map((shift, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(parseISO(shift.startTime), "EEE, MMM d")}</TableCell>
                    <TableCell>{formatTime(shift.startTime)}</TableCell>
                    <TableCell>{formatTime(shift.endTime)}</TableCell>
                    <TableCell>{shift.endTime ? shift.duration : "In progress"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No shifts recorded this week
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyShiftAttendancePanel;
