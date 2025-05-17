
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Product interfaces
export interface Product {
  product_id: number;
  name: string;
  product_code: string;
  description?: string;
  selling_price: number;
  purchase_price: number;
  category: string;
  min_stock_level: number;
  created_at?: string;
  updated_at?: string;
}

// Inventory interfaces
export interface InventoryItem {
  inventory_id: number;
  product_id: number;
  branch_id: number;
  quantity: number;
  last_restocked?: string;
  product?: Product;
}

// Order interfaces
export interface Order {
  order_id?: number;
  order_number: string;
  branch_id: number;
  branchName?: string;
  user_id: number;
  userName?: string;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  order_status?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  created_at?: string;
  order_items?: OrderItem[];
}

// Order Item interface
export interface OrderItem {
  item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

// Attendance interfaces
export interface AttendanceRecord {
  attendance_id?: number;
  user_id: number;
  branch_id: number;
  date: string;
  clock_in?: string;
  clock_out?: string;
  duration?: string;
  status?: string;
  notes?: string;
}

// Alert interfaces
export interface Alert {
  alert_id: number;
  alert_message: string;
  alert_type: string;
  related_table?: string;
  related_id?: number;
  branch_id?: number;
  created_at?: string;
  is_read?: boolean;
}

// Branch interfaces
export interface Branch {
  branch_id: number;
  branch_name: string;
  location: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
}

// Types for real-time subscriptions
type SubscriptionCallback<T> = (payload: { new: T; old: T | null; eventType: 'INSERT' | 'UPDATE' | 'DELETE' }) => void;

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

// API functions for Branches
export const fetchBranches = async (): Promise<Branch[]> => {
  const { data, error } = await supabase
    .from('branches')
    .select('*');
  
  if (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
  
  return data as Branch[];
};

// Analytics functions
export const fetchSalesByBranch = async (): Promise<{branch_id: number, branch_name: string, total_sales: number}[]> => {
  const { data: branchesData } = await supabase
    .from('branches')
    .select('branch_id, branch_name');
  
  const { data: ordersData } = await supabase
    .from('orders')
    .select('branch_id, total_amount');

  // Process the data to get sales by branch
  const salesByBranch = branchesData?.map(branch => {
    const branchOrders = ordersData?.filter(order => order.branch_id === branch.branch_id) || [];
    const totalSales = branchOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    return {
      branch_id: branch.branch_id,
      branch_name: branch.branch_name,
      total_sales: totalSales
    };
  }) || [];
  
  return salesByBranch;
};

// Utility function to unsubscribe from a channel
export const unsubscribe = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
