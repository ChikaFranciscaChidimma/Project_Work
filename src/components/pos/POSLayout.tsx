
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreditCard, Banknote, Smartphone, Building, DollarSign, Plus, Trash, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock products data
const products = [
  { id: 1, name: "Wireless Keyboard", price: 59.99, category: "electronics" },
  { id: 2, name: "Wireless Mouse", price: 29.99, category: "electronics" },
  { id: 3, name: "HD Monitor 24\"", price: 199.99, category: "electronics" },
  { id: 4, name: "USB-C Cable 1m", price: 12.99, category: "accessories" },
  { id: 5, name: "Laptop Sleeve 15\"", price: 24.99, category: "accessories" },
  { id: 6, name: "Bluetooth Speaker", price: 49.99, category: "audio" },
  { id: 7, name: "Wireless Earbuds", price: 79.99, category: "audio" },
  { id: 8, name: "Smartphone Stand", price: 15.99, category: "accessories" }
];

// Product categories
const categories = ["all", "electronics", "accessories", "audio"];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const POSLayout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activePaymentMethod, setActivePaymentMethod] = useState("cash");

  // Add item to cart
  const addToCart = (product: typeof products[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Filter products based on category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate total
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-8 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Input
                type="search"
                placeholder="Search products..."
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <TabsList className="w-full justify-start">
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    onClick={() => setActiveCategory(category)}
                    className={activeCategory === category ? "bg-primary text-primary-foreground" : ""}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="h-auto flex flex-col items-start p-4 justify-between hover:bg-secondary/10 transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div className="w-full">
                    <p className="font-medium text-left mb-1">{product.name}</p>
                    <p className="text-muted-foreground text-sm">{product.category}</p>
                  </div>
                  <div className="w-full flex items-center justify-between mt-3">
                    <p className="font-bold">${product.price.toFixed(2)}</p>
                    <Plus className="h-4 w-4" />
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Current Order</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cart is empty</p>
                <p className="text-sm text-muted-foreground mt-2">Add products to get started</p>
              </div>
            ) : (
              <div>
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between pb-2 border-b border-border">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 mt-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax (7%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className={cn("flex items-center gap-2 justify-center", 
                        activePaymentMethod === "cash" && "border-primary bg-primary/10"
                      )}
                      onClick={() => setActivePaymentMethod("cash")}
                    >
                      <Banknote className="h-4 w-4" />
                      Cash
                    </Button>
                    <Button 
                      variant="outline" 
                      className={cn("flex items-center gap-2 justify-center", 
                        activePaymentMethod === "card" && "border-primary bg-primary/10"
                      )}
                      onClick={() => setActivePaymentMethod("card")}
                    >
                      <CreditCard className="h-4 w-4" />
                      Card
                    </Button>
                    <Button 
                      variant="outline" 
                      className={cn("flex items-center gap-2 justify-center", 
                        activePaymentMethod === "mobile" && "border-primary bg-primary/10"
                      )}
                      onClick={() => setActivePaymentMethod("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                      Mobile
                    </Button>
                    <Button 
                      variant="outline" 
                      className={cn("flex items-center gap-2 justify-center", 
                        activePaymentMethod === "transfer" && "border-primary bg-primary/10"
                      )}
                      onClick={() => setActivePaymentMethod("transfer")}
                    >
                      <Building className="h-4 w-4" />
                      Transfer
                    </Button>
                  </div>
                </div>

                <Button className="w-full mt-6 gap-2">
                  <DollarSign className="h-4 w-4" />
                  Process Payment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2">
              Hold Order
            </Button>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={() => setCart([])}>
              <Trash className="h-4 w-4" />
              Clear Cart
            </Button>
            <Button variant="outline" className="gap-2 col-span-2">
              <CheckCircle className="h-4 w-4" />
              Apply Discount
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSLayout;
