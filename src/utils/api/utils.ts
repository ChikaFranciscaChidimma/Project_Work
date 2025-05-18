
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Utility function to unsubscribe from a channel
export const unsubscribe = (channel: RealtimeChannel) => {
  if (!channel) return;
  
  try {
    supabase.removeChannel(channel);
  } catch (error) {
    console.error("Error unsubscribing from channel:", error);
  }
};

// Debounce function to limit the frequency of function calls
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

// Skeleton component factory for consistent loading states
export const createSkeletonItems = (count: number, height: number = 50) => {
  return Array(count)
    .fill(0)
    .map((_, index) => ({
      id: `skeleton-${index}`,
      isLoading: true,
      height
    }));
};

// Check Supabase connection status and log to console
export const checkSupabaseConnection = async () => {
  try {
    console.log("Checking Supabase connection...");
    const { data, error } = await supabase.from('branches').select('branch_id').limit(1);
    
    if (error) {
      console.error("Supabase connection error:", error);
      return false;
    }
    
    console.log("Supabase connection successful:", data);
    return true;
  } catch (err) {
    console.error("Error checking Supabase connection:", err);
    return false;
  }
};

// Safely handle data loading with fallbacks
export const safeDataFetch = async <T>(
  fetchFn: () => Promise<T[]>,
  defaultValue: T[] = []
): Promise<T[]> => {
  try {
    const result = await fetchFn();
    return result || defaultValue;
  } catch (error) {
    console.error("Error fetching data:", error);
    return defaultValue;
  }
};
