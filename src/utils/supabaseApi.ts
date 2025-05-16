
import { supabase } from "@/integrations/supabase/client";

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

// Function to fetch low stock items
export const fetchLowStockItems = async (branchId?: number): Promise<InventoryItem[]> => {
  let query = supabase
    .from('inventory')
    .select(`
      *,
      product:product_id(*)
    `)
    .lt('quantity', supabase.rpc('inventory_min_stock_level'));
  
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching low stock items:", error);
    throw error;
  }
  
  return data as InventoryItem[];
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

export const fetchOrders = async (branchId?: number): Promise<Order[]> => {
  let query = supabase
    .from('orders')
    .select('*');
  
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
