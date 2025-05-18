
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, MapPin, Laptop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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

const ShiftAttendanceCard = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if already clocked in on page load
  useEffect(() => {
    const todayShifts = getShiftsForToday();
    const ongoingShift = todayShifts.find(shift => shift.endTime === null);
    
    if (ongoingShift) {
      setClockedIn(true);
      setStartTime(new Date(ongoingShift.startTime));
      setDuration(ongoingShift.duration);
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // If clocked in, calculate ongoing duration
      if (clockedIn && startTime && !endTime) {
        const durationMs = new Date().getTime() - startTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        setDuration(`${hours}h ${minutes}m`);
      }
    }, 60000);
    
    return () => clearInterval(timer);
  }, [clockedIn, startTime, endTime]);

  const getShiftsForToday = (): ShiftRecord[] => {
    if (!user) return [];
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const allShifts = JSON.parse(localStorage.getItem('shift-records') || '[]');
    
    return allShifts.filter((shift: ShiftRecord) => 
      shift.userId === user.id && shift.date === today
    );
  };

  const saveShiftRecord = (record: ShiftRecord) => {
    const allShifts = JSON.parse(localStorage.getItem('shift-records') || '[]');
    allShifts.push(record);
    localStorage.setItem('shift-records', JSON.stringify(allShifts));
  };

  const updateShiftRecord = (startTimeStr: string) => {
    if (!user) return;
    
    const allShifts = JSON.parse(localStorage.getItem('shift-records') || '[]');
    const updatedShifts = allShifts.map((shift: ShiftRecord) => {
      if (shift.userId === user.id && shift.startTime === startTimeStr && shift.endTime === null) {
        return {
          ...shift,
          endTime: new Date().toISOString(),
          duration: duration
        };
      }
      return shift;
    });
    
    localStorage.setItem('shift-records', JSON.stringify(updatedShifts));
    
    // After clocking out, also update staff attendance records
    updateStaffAttendance();
  };
  
  const updateStaffAttendance = () => {
    if (!user) return;
    
    // Get the current shift data
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const formattedStart = startTime ? format(startTime, "h:mm a") : "-";
    const formattedEnd = format(now, "h:mm a");
    
    // Create or update attendance record
    const attendanceRecords = JSON.parse(localStorage.getItem('staff-attendance') || '[]');
    
    // Check if this staff member already has an attendance record for today
    const existingRecordIndex = attendanceRecords.findIndex(
      (record: any) => record.userId === user.id && record.date === today
    );
    
    const attendanceRecord = {
      id: existingRecordIndex >= 0 ? attendanceRecords[existingRecordIndex].id : `att-${Date.now()}`,
      userId: user.id,
      name: user.name,
      role: user.role,
      branch: user.branchName,
      status: "Present",
      timeIn: formattedStart,
      timeOut: formattedEnd,
      date: today,
      duration: duration
    };
    
    if (existingRecordIndex >= 0) {
      // Update existing record
      attendanceRecords[existingRecordIndex] = attendanceRecord;
    } else {
      // Add new record
      attendanceRecords.push(attendanceRecord);
    }
    
    localStorage.setItem('staff-attendance', JSON.stringify(attendanceRecords));
  };

  const handleClockIn = () => {
    if (!user) return;
    
    const now = new Date();
    setStartTime(now);
    setClockedIn(true);
    setDuration("0h 0m");
    
    const newShift: ShiftRecord = {
      userId: user.id,
      userName: user.name,
      branchId: user.branchId || "",
      branchName: user.branchName || "",
      startTime: now.toISOString(),
      endTime: null,
      duration: "0h 0m",
      deviceInfo,
      locationInfo,
      date: format(now, 'yyyy-MM-dd')
    };
    
    saveShiftRecord(newShift);
    
    toast({
      title: "Clocked In",
      description: `You clocked in at ${format(now, "h:mm a")}`,
    });
  };

  const handleClockOut = () => {
    if (!user || !startTime) return;
    
    const now = new Date();
    setEndTime(now);
    setClockedIn(false);

    if (startTime) {
      const durationMs = now.getTime() - startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const finalDuration = `${hours}h ${minutes}m`;
      setDuration(finalDuration);
      
      // Update the ongoing shift record
      updateShiftRecord(startTime.toISOString());
    }
    
    toast({
      title: "Clocked Out",
      description: `You clocked out at ${format(now, "h:mm a")}`,
    });
  };

  // Mock data for device and location
  const deviceInfo = "Windows PC / Chrome Browser";
  const locationInfo = "Main Branch Office";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Shift Clock-In/Out
            </CardTitle>
            <CardDescription>
              Track your work hours
            </CardDescription>
          </div>
          <Badge variant={clockedIn ? "default" : "outline"}>
            {clockedIn ? "On Shift" : "Off Duty"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-muted-foreground">Current Date & Time:</p>
              <p className="font-medium">{format(currentTime, "EEEE, MMMM d, yyyy")}</p>
              <p className="font-medium">{format(currentTime, "h:mm a")}</p>
            </div>

            <div className="text-right">
              {startTime && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Shift Duration:</p>
                  <p className="font-medium">{duration}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {clockedIn ? (
              <Button onClick={handleClockOut} variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Clock Out
              </Button>
            ) : (
              <Button onClick={handleClockIn} className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Clock In
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Laptop className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Device:</span>
                </div>
                <span>{deviceInfo}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                </div>
                <span>{locationInfo}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftAttendanceCard;
