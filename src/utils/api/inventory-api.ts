
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { InventoryItem, SubscriptionCallback } from "./types";

// API functions for Inventory
export const fetchInventory = async (branchId?: number): Promise<InventoryItem[]> => {
  let query = supabase
    .from('inventory')
    .select(`
      *,
      product:product_id(*)
    `);
  
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
  
  return data as InventoryItem[];
};

// Subscribe to inventory changes
export const subscribeToInventory = (callback: SubscriptionCallback<InventoryItem>, branchId?: number): RealtimeChannel => {
  const channel = supabase
    .channel('inventory-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'inventory',
        filter: branchId ? `branch_id=eq.${branchId}` : undefined
      },
      (payload) => {
        callback({
          new: payload.new as InventoryItem,
          old: payload.old as InventoryItem | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        });
      }
    )
    .subscribe();
  
  return channel;
};

// Function to fetch low stock items
export const fetchLowStockItems = async (branchId?: number): Promise<InventoryItem[]> => {
  // First get all products to access their min_stock_level
  const { data: productsData } = await supabase
    .from('products')
    .select('product_id, min_stock_level');
  
  // Create a map for quick lookup
  const minStockMap = new Map();
  productsData?.forEach(product => {
    minStockMap.set(product.product_id, product.min_stock_level);
  });

  // Now query the inventory with the product details
  let query = supabase
    .from('inventory')
    .select(`
      *,
      product:product_id(*)
    `);
  
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching low stock items:", error);
    throw error;
  }
  
  // Filter low stock items
  const lowStockItems = data?.filter(item => {
    const minStockLevel = item.product?.min_stock_level || 5;
    return item.quantity < minStockLevel;
  }) || [];
  
  return lowStockItems as InventoryItem[];
};

// Subscribe to low stock alerts
export const subscribeToLowStockItems = (callback: (lowStockItems: InventoryItem[]) => void, branchId?: number): RealtimeChannel => {
  const channel = subscribeToInventory(async () => {
    // Refetch low stock items whenever inventory changes
    const lowStockItems = await fetchLowStockItems(branchId);
    callback(lowStockItems);
  }, branchId);
  
  return channel;
};
