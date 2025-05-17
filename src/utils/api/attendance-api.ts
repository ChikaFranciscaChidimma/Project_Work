
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { AttendanceRecord, SubscriptionCallback } from "./types";

// API functions for Attendance
export const recordClockIn = async (attendanceData: {
  user_id: number;
  branch_id: number;
  date: string;
}): Promise<AttendanceRecord> => {
  const { data, error } = await supabase
    .from('attendance')
    .insert([{
      ...attendanceData,
      clock_in: new Date().toISOString(),
      status: 'present'
    }])
    .select();
  
  if (error) {
    console.error("Error recording clock in:", error);
    throw error;
  }
  
  return data[0] as AttendanceRecord;
};

export const recordClockOut = async (
  attendanceId: number,
  duration: string
): Promise<AttendanceRecord> => {
  const { data, error } = await supabase
    .from('attendance')
    .update({
      clock_out: new Date().toISOString(),
      duration: duration
    })
    .eq('attendance_id', attendanceId)
    .select();
  
  if (error) {
    console.error("Error recording clock out:", error);
    throw error;
  }
  
  return data[0] as AttendanceRecord;
};

export const fetchAttendance = async (branchId?: number): Promise<AttendanceRecord[]> => {
  let query = supabase
    .from('attendance')
    .select('*');
  
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
  
  return data as AttendanceRecord[];
};

// Subscribe to attendance changes
export const subscribeToAttendance = (callback: SubscriptionCallback<AttendanceRecord>, branchId?: number): RealtimeChannel => {
  const channel = supabase
    .channel('attendance-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'attendance',
        filter: branchId ? `branch_id=eq.${branchId}` : undefined
      },
      (payload) => {
        callback({
          new: payload.new as AttendanceRecord,
          old: payload.old as AttendanceRecord | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        });
      }
    )
    .subscribe();
  
  return channel;
};
