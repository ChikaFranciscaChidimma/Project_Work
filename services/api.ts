const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('Using API base:', API_BASE_URL);

// Inventory API
export const fetchInventory = async (branchFilter?: string, options: RequestInit = {}) => {
  try {
    const url = new URL(`${API_BASE_URL}/products`);
    if (branchFilter) url.searchParams.append('branch', branchFilter);
    
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Just map the data - status should already be calculated by backend
    return data.map((item: any) => ({
      id: item._id || item.id,
      name: item.name,
      stock: item.stock,
      branch: item.branch,
      price: item.price,
      minStock: item.minStock,
      status: item.status // Directly use the status from backend
    }));
    
  } catch (error) {
    console.error('Full fetch error:', error);
    throw error;
  }
};

function getStatus(stock: number, minStock: number) {
  if (stock === 0) return "Out of Stock";
  if (stock <= minStock) return "Low Stock";
  return "In Stock";
}


export const deleteProduct = async (id: string) => {
  try {
    console.log(`Attempting to delete product with ID: ${id}`); // Debug log
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Delete response status:', response.status); // Debug log
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Delete error details:', errorData); // Debug log
      throw new Error(errorData.message || `Failed to delete product (Status: ${response.status})`);
    }
    
    const result = await response.json();
    console.log('Delete successful:', result); // Debug log
    return result;
  } catch (error) {
    console.error('Error in deleteProduct:', error); // Debug log
    throw error;
  }
};

// Orders API
export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CompletedOrder {
  id: string;
  orderId: string;
  customer: string;
  branch: string;
  date: string;
  status: string;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
  staff: string;
}

// Orders API
export const fetchCompletedOrders = async (branch?: string): Promise<CompletedOrder[]> => {
  try {
    const url = new URL(`${API_BASE_URL}/orders/completed`);
    if (branch) url.searchParams.append('branch', branch);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }

    // Ensure data.data exists and is an array
    const ordersArray = Array.isArray(data.data) ? data.data : [];
    
    return ordersArray.map((order: any) => {
      // Ensure we have a valid order object
      if (!order || typeof order !== 'object') {
        return {
          id: '',
          orderId: '',
          customer: '',
          branch: branch || '',
          date: new Date().toISOString(),
          status: 'unknown',
          total: 0,
          paymentMethod: 'unknown',
          items: [],
          staff: 'unknown'
        };
      }

      // Parse date safely
      let orderDate;
      try {
        orderDate = order.date ? new Date(order.date).toISOString() : new Date().toISOString();
      } catch {
        orderDate = new Date().toISOString();
      }

      // Ensure items is always an array
      const items = Array.isArray(order.items) ? order.items.map((item: any) => ({
        productId: item.product?._id || item.productId || '',
        productName: item.product?.name || item.productName || 'Unknown Product',
        price: item.priceAtPurchase || item.price || 0,
        quantity: item.quantity || 0,
        subtotal: (item.priceAtPurchase || item.price || 0) * (item.quantity || 0)
      })) : [];

      return {
        id: order._id || order.id || '',
        orderId: order.orderId || '',
        customer: order.customer || '',
        branch: order.branch || branch || '',
        date: orderDate,
        status: order.status || 'completed',
        total: order.total || 0,
        paymentMethod: order.paymentMethod || 'unknown',
        items,
        staff: order.createdBy?.name || order.staff || 'System'
      };
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

export const createOrder = async (orderData: {
  customer: string;
  branch: string;
  items: Array<{
    product: string;
    quantity: number;
  }>;
  paymentMethod: string;
  notes?: string;
}): Promise<CompletedOrder> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Sales API
export const fetchSalesData = async (period = 'weekly') => {
  try {
    const response = await fetch(`${API_BASE_URL}/sales?period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch sales data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

// Product API
export const createProduct = async (productData) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: productData.name,
      price: productData.price,
      stock: productData.stock, // Send stock instead of quantity
      branch: productData.branch,
      minStock: productData.minStock
    }),
  });
  
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

//CHATBOT API
export const queryChatbot = async (query: string, branch?: string, role?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ query, branch, role })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to query chatbot');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error querying chatbot:', error);
    throw error;
  }
};