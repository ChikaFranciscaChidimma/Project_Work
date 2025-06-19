import { useEffect, useState, useMemo } from "react"; 
import { fetchInventory, deleteProduct } from "../../../services/api";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  Plus,
  Search,
  Bell,
  FileUp,
  Info,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Alert as AlertComponent, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestStockAlert } from "@/components/TestStockAlert";
import { InventoryItem, InventoryStatus } from "../../../types/inventory";
import { Label } from "@/components/ui/label";
import { socketService } from "../../../services/socketService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  interface AlertType{
  id: string;
  title: string;
  message: string;
  time: string;
  type: "warning" | "success" | "info" | "error";
    productId?: string;
}




const inventoryFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  branch: z.string().min(1, "Please select a branch"),
  price: z.coerce.number().positive("Price must be a positive number"),
  stock: z.coerce.number().int().nonnegative("Quantity must be 0 or greater"),
  minStock: z.coerce
    .number()
    .int()
    .nonnegative("Minimum stock must be 0 or greater"),
});

interface InventoryPanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const InventoryPanel = ({
  compact = false,
  branchFilter,
}: InventoryPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [showFileUploadInfo, setShowFileUploadInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
   const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);
   const [restockAmount, setRestockAmount] = useState(0);
   const [showRestockDialog, setShowRestockDialog] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

   // Function to add alerts
  const addAlert = (newAlert: AlertType) => {
  setAlerts(prev => [newAlert, ...prev].slice(0, 10));
};

const handleRestock = async () => {
  if (!selectedProduct || restockAmount <= 0) return;

  try {
    const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stock: selectedProduct.stock + restockAmount
      })
    });

    if (!response.ok) throw new Error('Failed to restock');
    
    const updatedProduct = await response.json();
    setInventory(prev => prev.map(item => 
      item.id === updatedProduct._id ? updatedProduct : item
    ));
    
    toast({
      title: "Restock successful",
      description: `Added ${restockAmount} to ${selectedProduct.name}`,
    });
    
    setShowRestockDialog(false);
  } catch (error) {
    toast({
      title: "Restock failed",
      description: error.message,
      variant: "destructive",
    });
  }
};

// Check URL for highlighted product
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight) {
      setHighlightedProduct(highlight);
      // Remove highlight after 5 seconds
      const timer = setTimeout(() => {
        setHighlightedProduct(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        const data = await fetchInventory(branchFilter, { signal: abortController.signal });
        
        if (isMounted) {
          setInventory(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error("Failed to load inventory:", err);
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [branchFilter]);


useEffect(() => {
  // Initialize socket connection
  if (!socketService.isConnected()) {
    socketService.connect();
  }

  const handleProductUpdate = (data: { product: InventoryItem }) => {
    setInventory(prev => {
      // Check if product exists
      const exists = prev.some(item => item.id === data.product.id);
      
      if (exists) {
        // Update existing product
        return prev.map(item => 
          item.id === data.product.id ? { 
            ...data.product,
            status: data.product.status || getItemStatus(data.product.stock, data.product.minStock)
          } : item
        );
      } else {
        // Add new product
        return [...prev, {
          ...data.product,
          status: data.product.status || getItemStatus(data.product.stock, data.product.minStock)
        }];
      }
    });
  };

  const handleProductDeleted = (data: { productId: string }) => {
    setInventory(prev => prev.filter(item => item.id !== data.productId));
  };

  const handleStockAlert = (data: {
    type: 'low-stock' | 'out-of-stock',
    product: InventoryItem
  }) => {
    addAlert({
      id: `${data.product.id}-${Date.now()}`,
      title: data.type === 'out-of-stock' ? 'Out of Stock' : 'Low Stock',
      message: `${data.product.name} is ${data.type === 'out-of-stock' ? 'out of' : 'low on'} stock`,
      time: new Date().toLocaleTimeString(),
      type: data.type === 'out-of-stock' ? 'error' : 'warning',
      productId: data.product.id
    });
  };

  // Subscribe to events
  socketService.subscribe('product-updated', handleProductUpdate);
  socketService.subscribe('product-created', handleProductUpdate);
  socketService.subscribe('product-deleted', handleProductDeleted);
  socketService.subscribe('stock-alert', handleStockAlert);

  return () => {
    socketService.unsubscribe('product-updated');
    socketService.unsubscribe('product-created');
    socketService.unsubscribe('product-deleted');
    socketService.unsubscribe('stock-alert');
  };
}, []);

  // Use the stock alerts hook
  useStockAlerts(inventory);

  const toggleItemSelection = (id: string) => {
    if (!isSelectMode) {
      setIsSelectMode(true);
    }
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const cancelSelection = () => {
    setSelectedItems([]);
    setIsSelectMode(false);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      console.log("Deleting items:", selectedItems); // Debug log

      // Delete all selected items
      const results = await Promise.allSettled(
        selectedItems.map((id) => deleteProduct(id))
      );

      // Check for any failures
      const failedDeletes = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletes.length > 0) {
        console.error("Some deletions failed:", failedDeletes);
        throw new Error(
          `Failed to delete ${failedDeletes.length} items. Check console for details.`
        );
      }

      // Refresh inventory
      const data = await fetchInventory(branchFilter);
      setInventory(data);

      toast({
        title: "Deletion successful",
        description: `${selectedItems.length} items deleted`,
      });

      cancelSelection();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Delete error:", error); // Debug log
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


const getItemStatus = (stock: number, minStock: number): InventoryStatus => {
  if (stock === 0) return "Out of Stock";
  if (stock <= minStock) return "Low Stock";
  return "In Stock";
};

  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const form = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      branch: "",
      price: 0,
      stock: 0,
      minStock: 0,
    },
  });

const filteredInventory = useMemo(() => {
  return inventory
    .map(item => ({
      ...item,
      status: item.status || getItemStatus(item.stock, item.minStock)
    }))
    .filter(item => {
      if (branchFilter && item.branch !== branchFilter) return false;
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
}, [inventory, branchFilter, searchTerm]);


 const lowStockItems = useMemo(() => {
  return filteredInventory.filter(item => 
    getItemStatus(item.stock, item.minStock) !== "In Stock"
  );
}, [filteredInventory]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/products/import`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload CSV");
      }

      const { importedItems } = await response.json();
      setInventory((prev) => [...prev, ...importedItems]);

      toast({
        title: "Import successful",
        description: `Added ${importedItems.length} items to inventory`,
      });
      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      e.target.value = "";
    }
  };

  const onSubmit = async (data: z.infer<typeof inventoryFormSchema>) => {
    try {
      const newItem = {
        name: data.name,
        branch: data.branch,
        price: data.price,
        stock: data.stock,
        minStock: data.minStock,
        status: getItemStatus(data.stock, data.minStock),
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error("Failed to add item");

      const createdItem = await response.json();
      setInventory(prev => {
      const newInventory = [...prev, createdItem];
      return newInventory;
    });

     // Force a re-render by updating a dummy state
    setSearchTerm(prev => prev + ' ');


      toast({
        title: "Item added successfully",
        description: `${data.name} has been added to inventory`,
      });

      form.reset();
      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Error adding item",
        description: error.message.includes("Minimum stock level")
          ? error.message
          : "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading inventory...</p>
      </div>
    );

  if (error)
    return (
      <AlertComponent variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </AlertComponent>
    );

  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            {branchFilter
              ? `Track real-time stock levels for ${branchFilter}`
              : "Track real-time stock levels across all branches"}
          </CardDescription>
        </div>

        {!compact && isAdmin && !branchFilter && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
           <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Restock {selectedProduct?.name}</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="amount" className="text-right">
          Amount to Add
        </Label>
        <Input
          id="amount"
          type="number"
          min="1"
          value={restockAmount}
          onChange={(e) => setRestockAmount(Number(e.target.value))}
          className="col-span-3"
        />
      </div>
    </div>
    <DialogFooter>
      <Button onClick={handleRestock}>Confirm Restock</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
            {isSelectMode ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={selectedItems.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedItems.length})
                </Button>
                <Button variant="outline" onClick={cancelSelection}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsSelectMode(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Items
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {lowStockItems.length > 0 && !compact && (
          <AlertComponent className="mb-4 border-amber-500">
            <Bell className="h-4 w-4 text-amber-500" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
              {lowStockItems.length} items require attention. Consider
              restocking soon.
            </AlertDescription>
          </AlertComponent>
        )}

        {!compact && (
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        )}

        {inventory.length === 0 && !loading && (
          <div className="text-center py-8">
            <Box className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No inventory items found.</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-1">
                Start by adding items or importing a CSV file.
              </p>
            )}
          </div>
        )}

        {inventory.length > 0 && (
          <div className={compact ? "max-h-[200px] overflow-y-auto" : ""}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  {!branchFilter && <TableHead>Branch</TableHead>}
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory
                    .slice(0, compact ? 3 : undefined)
                    .map((item) => (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "hover:bg-amber-100/30 transition-colors cursor-pointer",
                          selectedItems.includes(item.id) &&
                            "bg-amber-100/50 border-l-amber-500/50",
                             highlightedProduct === item.id && "bg-blue-100/50 border-l-blue-500 animate-pulse"
                        )}
                        onClick={() =>
                          isSelectMode && toggleItemSelection(item.id)
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {isSelectMode && (
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                              />
                            )}
                            <span
                              className={cn(
                                selectedItems.includes(item.id)
                                  ? "font-semibold"
                                  : "",
                                "text-foreground"
                              )}
                            >
                              {item.name}
                            </span>
                          </div>
                        </TableCell>
                        {!branchFilter && <TableCell>{item.branch}</TableCell>}
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "In Stock"
                                ? "default"
                                : item.status === "Low Stock"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.stock}
                        </TableCell>
                        <TableCell>
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => {
      setSelectedProduct(item);
      setShowRestockDialog(true);
    }}
    disabled={item.status === "In Stock"}
  >
    Restock
  </Button>
</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={branchFilter ? 4 : 5}
                      className="text-center py-8"
                    >
                      No inventory items found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {compact && filteredInventory.length > 3 && (
              <div className="mt-2 text-center">
                <Button variant="link" size="sm">
                  View all inventory
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.length} selected
              item(s)?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="list-disc pl-5 max-h-60 overflow-y-auto">
              {selectedItems.map((id) => {
                const item = inventory.find((i) => i.id === id);
                return item ? (
                  <li key={id}>
                    {item.name} ({item.branch})
                  </li>
                ) : null;
              })}
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Check className="h-4 w-4 mr-2" />
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Choose an option below to add inventory items
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Branch 1">Branch 1</SelectItem>
                            <SelectItem value="Branch 2">Branch 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock Level</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Item</Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mb-4 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Upload Inventory File
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    File must contain these headers: Product, Branch, Price,
                    Quantity, Minimum
                  </p>
                  <div className="flex justify-center">
                    <Button asChild variant="secondary" className="relative">
                      <>
                        <FileUp className="h-4 w-4 mr-2" />
                        Choose CSV File
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFileUploadInfo(!showFileUploadInfo)}
                      className="ml-2"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {showFileUploadInfo && (
                  <AlertComponent>
                    <AlertTitle>CSV Format Guidelines</AlertTitle>
                    <AlertDescription>
                      <p>Your CSV file should include these headers:</p>
                      <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                        <li>Product - Product name</li>
                        <li>Branch - Branch name (Branch 1, Branch 2)</li>
                        <li>Price - Product price (numbers only)</li>
                        <li>Quantity - Available stock (integer)</li>
                        <li>Minimum - Minimum stock level (integer)</li>
                      </ul>
                    </AlertDescription>
                  </AlertComponent>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InventoryPanel;
