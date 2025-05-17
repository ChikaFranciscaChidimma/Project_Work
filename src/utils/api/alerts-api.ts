
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Alert, SubscriptionCallback } from "./types";

// API functions for Alerts
export const fetchAlerts = async (branchId?: number): Promise<Alert[]> => {
  let query = supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
  
  return data as Alert[];
};

// Subscribe to alerts
export const subscribeToAlerts = (callback: SubscriptionCallback<Alert>, branchId?: number): RealtimeChannel => {
  const channel = supabase
    .channel('alerts-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'alerts',
        filter: branchId ? `branch_id=eq.${branchId}` : undefined
      },
      (payload) => {
        callback({
          new: payload.new as Alert,
          old: payload.old as Alert | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        });
      }
    )
    .subscribe();
  
  return channel;
};
