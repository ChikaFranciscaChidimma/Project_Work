export interface InventoryItem {
   _id: string;
  name: string;
  stock: number;
  branch: string;
  price: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CompletedOrder {
  _id: string;
  orderId: string;
  productName: string;
  customer: string;
  date: string;
  total: number;
  branch: string;
  status: string;
}

export interface SalesData {
  name: string;
  Total: number;
  OnlineOrders: number;
  InStoreOrders: number;
}

export interface ProductData {
  name: string;
  price: number;
  stock: number;
  branch: string;
  minStock: number;
}