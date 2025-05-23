import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Mock products data
const products = [
  { id: "1", name: "Wireless Keyboard", price: 59.99 },
  { id: "2", name: "Wireless Mouse", price: 29.99 },
  { id: "3", name: "HD Monitor 24\"", price: 199.99 },
  { id: "4", name: "USB-C Cable 1m", price: 12.99 },
  { id: "5", name: "Laptop Sleeve 15\"", price: 24.99 },
  { id: "6", name: "Bluetooth Speaker", price: 49.99 },
  { id: "7", name: "Wireless Earbuds", price: 79.99 },
  { id: "8", name: "Smartphone Stand", price: 15.99 },
  { id: "9", name: "Ergonomic Mouse Pad", price: 19.99 },
  { id: "10", name: "Webcam Cover", price: 5.99 },
  { id: "11", name: "USB Hub", price: 34.99 },
  { id: "12", name: "Desk Cable Organizer", price: 14.99 },
  { id: "13", name: "Phone Charging Stand", price: 27.99 },
  { id: "14", name: "Portable SSD 500GB", price: 89.99 },
  { id: "15", name: "Noise Cancelling Headphones", price: 129.99 }
];

// Payment types
const paymentTypes = [
  { id: "cash", name: "Cash" },
  { id: "card", name: "Credit/Debit Card" },
  { id: "mobile", name: "Mobile Payment" },
  { id: "transfer", name: "Bank Transfer" }
];

// Define schema with updated validation rules
const formSchema = z.object({
  productId: z.string({
    required_error: "Please select a product",
  }),
  quantity: z.coerce.number()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
  discount: z.coerce.number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
  paymentType: z.string({
    required_error: "Please select a payment type",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CompletedOrder {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  paymentType: string;
  paymentTypeName: string;
  date: string;
  branchId: string;
  branchName: string;
  userId: string;
  userName: string;
  status: string;
}

const SalesRecordCard = () => {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const [openProductSelector, setOpenProductSelector] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      discount: 0,
    },
    mode: "onChange", // Enable validation on change
  });

  // Check if the form is valid
  const isFormValid = form.formState.isValid && selectedProduct;

  const onProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    calculateTotal(product, form.getValues().quantity, form.getValues().discount);
    form.setValue("productId", productId);
  };

  const calculateTotal = (product: typeof products[0] | null, quantity: number, discountPercentage: number) => {
    if (!product) {
      setCalculatedTotal(null);
      return;
    }
    
    const subtotal = product.price * quantity;
    const discount = subtotal * (discountPercentage / 100);
    const total = subtotal - discount;
    setCalculatedTotal(total);
  };

  const onFieldChange = () => {
    const values = form.getValues();
    calculateTotal(selectedProduct, values.quantity, values.discount);
  };

  const saveCompletedOrder = (order: CompletedOrder) => {
    const existingOrders = JSON.parse(localStorage.getItem('completed-orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('completed-orders', JSON.stringify(existingOrders));
  };

  const onSubmit = (data: FormValues) => {
    if (!user || !selectedProduct || calculatedTotal === null) return;
    
    const product = products.find(p => p.id === data.productId);
    const paymentTypeDetails = paymentTypes.find(p => p.id === data.paymentType);
    
    if (!product || !paymentTypeDetails) return;
    
    // Create a completed order
    const newOrder: CompletedOrder = {
      id: `order-${Date.now()}`,
      orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      productId: product.id,
      productName: product.name,
      quantity: data.quantity,
      price: product.price,
      discount: data.discount,
      total: calculatedTotal,
      paymentType: data.paymentType,
      paymentTypeName: paymentTypeDetails.name,
      date: new Date().toISOString(),
      branchId: user.branchId || "",
      branchName: user.branchName || "",
      userId: user.id,
      userName: user.name,
      status: "Completed"
    };
    
    // Save the order
    saveCompletedOrder(newOrder);
    
    // Show success toast
    toast({
      title: "Sale Recorded Successfully",
      description: `${data.quantity}x ${product.name} sold for $${calculatedTotal.toFixed(2)} via ${paymentTypeDetails.name}`,
    });
    
    // Reset the form
    form.reset({
      productId: "",
      quantity: 1,
      discount: 0,
      paymentType: "",
    });
    setSelectedProduct(null);
    setCalculatedTotal(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Record Sale
        </CardTitle>
        <CardDescription>Record items sold at your branch</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Search & Select Product</FormLabel>
                  <Popover open={openProductSelector} onOpenChange={setOpenProductSelector}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openProductSelector}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? products.find((product) => product.id === field.value)?.name
                            : "Search for a product..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search products..." />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  onProductChange(product.id);
                                  setOpenProductSelector(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    product.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {product.name} - ${product.price.toFixed(2)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          onFieldChange();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onFieldChange();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {calculatedTotal !== null && (
              <div className="py-2 border-t border-border mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">${calculatedTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-2" disabled={!isFormValid}>
              Record Sale
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SalesRecordCard;
