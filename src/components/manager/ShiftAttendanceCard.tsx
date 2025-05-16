
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, MapPin, Laptop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { recordClockIn, recordClockOut } from "@/utils/supabaseApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ShiftAttendanceCard = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [currentAttendanceId, setCurrentAttendanceId] = useState<number | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Convert user to numeric id for API
  const userId = user?.id ? parseInt(user.id) : 0;
  const branchId = user?.branchName === "Branch 1" ? 1 : user?.branchName === "Branch 2" ? 2 : 0;

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

  // Clock In mutation
  const clockInMutation = useMutation({
    mutationFn: recordClockIn,
    onSuccess: (data) => {
      setCurrentAttendanceId(data.attendance_id || null);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Clocked In",
        description: `You clocked in at ${format(new Date(), "h:mm a")}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive",
      });
      console.error("Clock in error:", error);
    }
  });

  // Clock Out mutation
  const clockOutMutation = useMutation({
    mutationFn: ({ attendanceId, duration }: { attendanceId: number, duration: string }) => 
      recordClockOut(attendanceId, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Clocked Out",
        description: `You clocked out at ${format(new Date(), "h:mm a")}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clock out. Please try again.",
        variant: "destructive",
      });
      console.error("Clock out error:", error);
    }
  });

  const handleClockIn = () => {
    if (!user || !userId || !branchId) {
      toast({
        title: "Error",
        description: "User information is incomplete. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    setStartTime(now);
    setClockedIn(true);
    setDuration("0h 0m");
    
    clockInMutation.mutate({
      user_id: userId,
      branch_id: branchId,
      date: format(now, 'yyyy-MM-dd')
    });
  };

  const handleClockOut = () => {
    if (!currentAttendanceId) {
      toast({
        title: "Error",
        description: "No active shift found.",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    setEndTime(now);
    setClockedIn(false);

    if (startTime) {
      const durationMs = now.getTime() - startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const finalDuration = `${hours}h ${minutes}m`;
      setDuration(finalDuration);
      
      clockOutMutation.mutate({
        attendanceId: currentAttendanceId,
        duration: finalDuration
      });
    }
  };

  // Mock data for device and location (would normally be detected)
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
              <Button 
                onClick={handleClockOut} 
                variant="destructive" 
                className="w-full" 
                disabled={clockOutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {clockOutMutation.isPending ? "Processing..." : "Clock Out"}
              </Button>
            ) : (
              <Button 
                onClick={handleClockIn} 
                className="w-full" 
                disabled={clockInMutation.isPending}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {clockInMutation.isPending ? "Processing..." : "Clock In"}
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
