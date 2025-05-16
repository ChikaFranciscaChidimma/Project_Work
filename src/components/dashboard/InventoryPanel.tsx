
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Box, Plus, Search, Bell, FileUp, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

// Local storage key for inventory
const INVENTORY_STORAGE_KEY = "branchsync-inventory";

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  branch: string;
  price: string;
  minStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

// Form schema for adding inventory
const inventoryFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  branch: z.string().min(1, "Please select a branch"),
  price: z.coerce.number().positive("Price must be a positive number"),
  stock: z.coerce.number().int().nonnegative("Quantity must be 0 or greater"),
  minStock: z.coerce.number().int().nonnegative("Minimum stock must be 0 or greater")
});

interface InventoryPanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const InventoryPanel = ({ compact = false, branchFilter }: InventoryPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFileUploadInfo, setShowFileUploadInfo] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    // Load inventory from localStorage or use empty array
    const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return savedInventory ? JSON.parse(savedInventory) : [];
  });
  
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
    }
  });

  // Filter inventory based on search term and branch filter
  const filteredInventory = inventory.filter(item => {
    // Apply branch filter first if provided
    if (branchFilter && item.branch !== branchFilter) {
      return false;
    }
    
    // Then apply search filter
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branch.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get low stock items for the current branch
  const lowStockItems = filteredInventory.filter(item => 
    item.status === "Low Stock" || item.status === "Out of Stock"
  );

  // Save inventory to localStorage
  const saveInventory = (items: InventoryItem[]) => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    setInventory(items);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          // Validate headers
          const requiredHeaders = ['product', 'branch', 'price', 'quantity', 'minimum'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            toast({
              title: "Invalid CSV format",
              description: `Missing headers: ${missingHeaders.join(', ')}`,
              variant: "destructive"
            });
            return;
          }
          
          // Process data rows
          const newItems: InventoryItem[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            const values = lines[i].split(',').map(v => v.trim());
            const rowData: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              rowData[header] = values[index] || '';
            });
            
            const stock = parseInt(rowData.quantity);
            const minStock = parseInt(rowData.minimum);
            const status = stock <= minStock 
              ? (stock === 0 ? "Out of Stock" : "Low Stock") 
              : "In Stock";
            
            newItems.push({
              id: Date.now() + i, // Generate unique ID
              name: rowData.product,
              branch: rowData.branch,
              price: `$${parseFloat(rowData.price).toFixed(2)}`,
              stock: stock,
              minStock: minStock,
              status: status
            });
          }
          
          if (newItems.length > 0) {
            saveInventory([...inventory, ...newItems]);
            toast({
              title: "Import successful",
              description: `Added ${newItems.length} items to inventory`,
            });
          } else {
            toast({
              title: "No items imported",
              description: "The file contained no valid data rows",
              variant: "destructive"
            });
          }
        } catch (error) {
          toast({
            title: "Error processing file",
            description: "Please check the file format and try again",
            variant: "destructive"
          });
        }
      };
      
      reader.readAsText(file);
    }
    
    // Reset the file input
    e.target.value = '';
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof inventoryFormSchema>) => {
    const newItem: InventoryItem = {
      id: Date.now(),
      name: data.name,
      branch: data.branch,
      price: `$${data.price.toFixed(2)}`,
      stock: data.stock,
      minStock: data.minStock,
      status: data.stock <= data.minStock 
        ? (data.stock === 0 ? "Out of Stock" : "Low Stock") 
        : "In Stock"
    };
    
    const updatedInventory = [...inventory, newItem];
    saveInventory(updatedInventory);
    
    toast({
      title: "Item added successfully",
      description: `${data.name} has been added to inventory`,
    });
    
    // Reset form and close dialog
    form.reset();
    setShowAddDialog(false);
  };

  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            {branchFilter 
              ? `Track real-time stock levels for ${branchFilter}` 
              : "Track real-time stock levels across all branches"
            }
          </CardDescription>
        </div>
        
        {!compact && isAdmin && !branchFilter && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {lowStockItems.length > 0 && !compact && (
          <Alert className="mb-4 border-amber-500">
            <Bell className="h-4 w-4 text-amber-500" />
            <AlertTitle>Low Stock Alert</AlertTitle>
            <AlertDescription>
              {lowStockItems.length} items require attention. Consider restocking soon.
            </AlertDescription>
          </Alert>
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
        
        {inventory.length === 0 && (
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
                  filteredInventory.slice(0, compact ? 3 : undefined).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      {!branchFilter && <TableCell>{item.branch}</TableCell>}
                      <TableCell>{item.price}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === "In Stock" 
                            ? "default"
                            : item.status === "Low Stock" 
                              ? "secondary" 
                              : "destructive"
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={branchFilter ? 4 : 5} className="text-center py-8">
                      No inventory items found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {compact && filteredInventory.length > 3 && (
              <div className="mt-2 text-center">
                <Button variant="link" size="sm">View all inventory</Button>
              </div>
            )}
          </div>
        )}
        
        {isAdmin && !compact && (
          <CardFooter className="flex flex-col items-start space-y-4 pt-4 px-0 mt-4 border-t">
            <Alert className="w-full bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center">
                📦 Inventory will be stored in a connected database. Please define your API or database integration endpoint.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row w-full sm:items-center gap-2 sm:gap-4">
              <p className="text-sm font-medium">Bulk Import:</p>
              <div className="flex items-center gap-2 flex-1">
                <Button variant="outline" asChild className="relative">
                  <>
                    <FileUp className="h-4 w-4 mr-2" />
                    Import CSV
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
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showFileUploadInfo && (
              <Alert className="w-full">
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
              </Alert>
            )}
          </CardFooter>
        )}
      </CardContent>
      
      {/* Add Inventory Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Enter the details for the new inventory item.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
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
                        <Input type="number" min="0" placeholder="0" {...field} />
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
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InventoryPanel;
