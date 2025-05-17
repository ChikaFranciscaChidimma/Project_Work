
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Utility function to unsubscribe from a channel
export const unsubscribe = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
