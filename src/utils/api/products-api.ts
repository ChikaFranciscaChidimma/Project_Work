
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Product, SubscriptionCallback } from "./types";

// API functions for Products
export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
  
  return data as Product[];
};

// Subscribe to product changes
export const subscribeToProducts = (callback: SubscriptionCallback<Product>): RealtimeChannel => {
  const channel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload) => {
        callback({
          new: payload.new as Product,
          old: payload.old as Product | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        });
      }
    )
    .subscribe();
  
  return channel;
};
