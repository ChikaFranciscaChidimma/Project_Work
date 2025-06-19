// hooks/useStockAlerts.ts
import { useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { notificationService, createStockAlert } from "../../services/notificationService";

interface Alert {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "warning" | "success" | "info" | "error";
}

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  branch: string;
  price: number;
  minStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

// Updated useStockAlerts.ts
export const useStockAlerts = (inventory: InventoryItem[]) => {
  const prevInventoryRef = useRef<InventoryItem[]>([]);

   useEffect(() => {
    // Compare current inventory with previous to detect stock changes
    inventory.forEach(item => {
      const prevItem = prevInventoryRef.current.find(i => i.id === item.id);
      if (prevItem && prevItem.stock !== item.stock) {
        createStockAlert(item, prevItem.stock);
      }
    });

    // Update the ref for next comparison
    prevInventoryRef.current = inventory;
  }, [inventory]);
};