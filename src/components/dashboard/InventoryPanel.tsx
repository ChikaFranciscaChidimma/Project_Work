import { useState, useEffect } from "react";
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
import { Box, Plus, Search, Bell, Info, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { fetchInventory, fetchLowStockItems, Product } from "@/utils/supabaseApi";
import { useQuery } from "@tanstack/react-query";

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
  const [activeTab, setActiveTab] = useState("manual");
  const [showFileUploadInfo, setShowFileUploadInfo] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  // Convert branch name to ID for API calls if needed
  const branchId = branchFilter 
    ? (branchFilter === "Branch 1" ? 1 : branchFilter === "Branch 2" ? 2 : undefined)
    : undefined;
  
  // Fetch inventory data using React Query
  const { data: inventoryItems = [], isLoading: isLoadingInventory, error: inventoryError } = useQuery({
    queryKey: ['inventory', branchId],
    queryFn: () => fetchInventory(branchId),
  });
  
  // Fetch low stock items
  const { data: lowStockItems = [], isLoading: isLoadingLowStock } = useQuery({
    queryKey: ['lowStockItems', branchId],
    queryFn: () => fetchLowStockItems(branchId),
  });
  
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
  
  // Show error toast if there's an API error
  useEffect(() => {
    if (inventoryError) {
      toast({
        title: "Error fetching inventory",
        description: "Could not load inventory data. Please try again later.",
        variant: "destructive"
      });
    }
  }, [inventoryError, toast]);

  // Filter inventory based on search term
  const filteredInventory = inventoryItems.filter(item => {
    return (
      (item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.product?.product_code?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File upload implementation would be updated to work with Supabase
      toast({
        title: "File upload with Supabase",
        description: "This feature will be updated to work with Supabase Storage",
      });
    }
    
    // Reset the file input
    e.target.value = '';
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof inventoryFormSchema>) => {
    // Form submission would be updated to work with Supabase
    toast({
      title: "Adding product to Supabase",
      description: "This feature will be updated to work with Supabase API",
    });
    
    // Reset form and close dialog
    form.reset();
    setShowAddDialog(false);
  };

  // Format inventory item for display
  const formatInventoryItem = (item: any) => {
    const product = item.product || {};
    const stock = item.quantity;
    const status = 
      stock === 0 ? "Out of Stock" :
      stock <= (product.min_stock_level || 10) ? "Low Stock" : "In Stock";
    
    return {
      id: item.inventory_id,
      name: product.name || "Unknown Product",
      branch: branchId === 1 ? "Branch 1" : branchId === 2 ? "Branch 2" : "Unknown Branch",
      price: `$${product.selling_price?.toFixed(2) || '0.00'}`,
      stock: stock,
      minStock: product.min_stock_level || 0,
      status: status
    };
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
        
        {isLoadingInventory ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading inventory data...</p>
          </div>
        ) : inventoryItems.length === 0 ? (
          <div className="text-center py-8">
            <Box className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No inventory items found.</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-1">
                Start by adding items or importing a CSV file.
              </p>
            )}
          </div>
        ) : (
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
                  filteredInventory.slice(0, compact ? 3 : undefined).map((item) => {
                    const formattedItem = formatInventoryItem(item);
                    return (
                      <TableRow key={formattedItem.id}>
                        <TableCell className="font-medium">{formattedItem.name}</TableCell>
                        {!branchFilter && <TableCell>{formattedItem.branch}</TableCell>}
                        <TableCell>{formattedItem.price}</TableCell>
                        <TableCell>
                          <Badge variant={
                            formattedItem.status === "In Stock" 
                              ? "default"
                              : formattedItem.status === "Low Stock" 
                                ? "secondary" 
                                : "destructive"
                          }>
                            {formattedItem.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formattedItem.stock}</TableCell>
                      </TableRow>
                    );
                  })
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
                📦 Inventory is now connected to Supabase. Data is fetched from your Supabase database.
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </CardContent>
      
      {/* The dialog component remains largely the same */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Choose an option below to add inventory items.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload Inventory File</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
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
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mb-4 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Upload Inventory File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    File must contain these headers: Product, Branch, Price, Quantity, Minimum
                  </p>
                  <div className="flex justify-center">
                    <Button asChild variant="secondary" className="relative">
                      <>
                        <Upload className="h-4 w-4 mr-2" />
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
                  <Alert>
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
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Close</Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InventoryPanel;
