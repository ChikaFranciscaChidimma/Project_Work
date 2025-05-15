
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { Box, Plus, Search, Bell } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock inventory data
const mockInventory = [
  { id: 1, name: "Laptop Dell XPS 13", stock: 24, branch: "Branch 1", price: "$1299.99", status: "In Stock" },
  { id: 2, name: "Wireless Mouse", stock: 45, branch: "Branch 1", price: "$24.99", status: "In Stock" },
  { id: 3, name: "USB-C Cable", stock: 8, branch: "Branch 2", price: "$12.99", status: "Low Stock" },
  { id: 4, name: "Mechanical Keyboard", stock: 3, branch: "Branch 2", price: "$89.99", status: "Low Stock" },
  { id: 5, name: "Headphones", stock: 0, branch: "Branch 1", price: "$149.99", status: "Out of Stock" },
  { id: 6, name: "Monitor 24\"", stock: 12, branch: "Branch 2", price: "$199.99", status: "In Stock" },
];

interface InventoryPanelProps {
  compact?: boolean;
  branchFilter?: string;
}

const InventoryPanel = ({ compact = false, branchFilter }: InventoryPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter inventory based on search term and branch filter
  const filteredInventory = mockInventory.filter(item => {
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
        
        {!compact && (
          <div className="flex items-center space-x-2">
            <Button>
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
      </CardContent>
    </Card>
  );
};

export default InventoryPanel;
