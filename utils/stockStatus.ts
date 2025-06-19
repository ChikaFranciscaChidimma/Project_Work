// utils/stockStatus.ts
export const getStockStatus = (stock: number, minStock: number): string => {
  if (stock === 0) return "Out of Stock";
  if (stock <= minStock) return "Low Stock";
  return "In Stock";
};

export const getStockStatusVariant = (status: string) => {
  switch (status) {
    case "In Stock": return "default";
    case "Low Stock": return "secondary";
    case "Out of Stock": return "destructive";
    default: return "outline";
  }
};