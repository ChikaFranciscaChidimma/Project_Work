// types/inventory.ts
export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  branch: string;
  price: number;
  minStock: number;
  status: InventoryStatus;
}