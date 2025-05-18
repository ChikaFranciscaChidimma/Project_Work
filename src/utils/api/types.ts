
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
export type SubscriptionCallback<T> = (payload: { 
  new: T; 
  old: T | null; 
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' 
}) => void;
