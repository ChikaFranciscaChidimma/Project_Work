
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Order, OrderItem, SubscriptionCallback } from "./types";

// API functions for Orders
export const createOrder = async (orderData: Omit<Order, 'order_id'>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();
  
  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }
  
  return data[0] as Order;
};

// Function to create order items
export const createOrderItems = async (orderItems: Omit<OrderItem, 'item_id'>[]): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();
  
  if (error) {
    console.error("Error creating order items:", error);
    throw error;
  }
  
  return data as OrderItem[];
};

export const fetchOrders = async (branchId?: number): Promise<Order[]> => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `);
  
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
  
  return data as Order[];
};

// Subscribe to order changes
export const subscribeToOrders = (callback: SubscriptionCallback<Order>, branchId?: number): RealtimeChannel => {
  const channel = supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: branchId ? `branch_id=eq.${branchId}` : undefined
      },
      (payload) => {
        callback({
          new: payload.new as Order,
          old: payload.old as Order | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        });
      }
    )
    .subscribe();
  
  return channel;
};
