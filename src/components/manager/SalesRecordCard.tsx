
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

// Mock products data
const products = [
  { id: "1", name: "Wireless Keyboard", price: 59.99 },
  { id: "2", name: "Wireless Mouse", price: 29.99 },
  { id: "3", name: "HD Monitor 24\"", price: 199.99 },
  { id: "4", name: "USB-C Cable 1m", price: 12.99 },
  { id: "5", name: "Laptop Sleeve 15\"", price: 24.99 },
  { id: "6", name: "Bluetooth Speaker", price: 49.99 },
  { id: "7", name: "Wireless Earbuds", price: 79.99 },
  { id: "8", name: "Smartphone Stand", price: 15.99 }
];

// Payment types
const paymentTypes = [
  { id: "cash", name: "Cash" },
  { id: "card", name: "Credit/Debit Card" },
  { id: "mobile", name: "Mobile Payment" },
  { id: "transfer", name: "Bank Transfer" }
];

// Define schema for form validation
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

const SalesRecordCard = () => {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      discount: 0,
    },
  });

  const onProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    calculateTotal(product, form.getValues().quantity, form.getValues().discount);
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

  const onSubmit = (data: FormValues) => {
    // In a real app, this would send data to an API
    console.log("Sales data submitted:", data);
    console.log("Calculated total:", calculatedTotal);
    
    // Get product name for more user-friendly toast
    const productName = products.find(p => p.id === data.productId)?.name || "Product";
    const paymentTypeName = paymentTypes.find(p => p.id === data.paymentType)?.name || "Payment";
    
    toast({
      title: "Sale Recorded Successfully",
      description: `${data.quantity}x ${productName} sold for $${calculatedTotal?.toFixed(2)} via ${paymentTypeName}`,
    });
    
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
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      onProductChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            <Button type="submit" className="w-full mt-2">
              Record Sale
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SalesRecordCard;
