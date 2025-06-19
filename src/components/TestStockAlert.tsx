// components/TestStockAlert.tsx
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { InventoryItem } from "../../types/inventory";

interface TestStockAlertProps {
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
}

export const TestStockAlert = ({ inventory, setInventory }: TestStockAlertProps) => {
  const { toast } = useToast();

  const triggerLowStock = () => {
    if (inventory.length === 0) {
      toast({
        title: "No items to modify",
        description: "Add some inventory items first",
        variant: "destructive",
      });
      return;
    }

    const updated = inventory.map(item => ({
      ...item,
      stock: item.id === inventory[0].id ? item.minStock - 1 : item.stock
    }));

    setInventory(updated);
    toast({
      title: "Stock modified for testing",
      description: `Set ${inventory[0].name} to low stock (${inventory[0].minStock - 1} items)`,
    });
  };

  return (
    <Button variant="outline" onClick={triggerLowStock}>
      Simulate Low Stock
    </Button>
  );
};