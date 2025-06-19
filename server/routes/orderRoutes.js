import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const router = express.Router();

const handleError = (res, error) => {
  console.error('Order Route Error:', error);
  res.status(500).json({ 
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};


// Create test data with real products
router.post('/test-data', async (req, res) => {
  try {
    await Order.deleteMany({});
    
    // Get some real products from database
    const products = await Product.find().limit(3).lean();
    
    if (products.length === 0) {
      return res.status(400).json({ 
        message: 'No products found in database. Please add products first.' 
      });
    }
    
    const testOrders = [
      {
        orderId: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        customer: "John Doe",
        branch: "Branch 1",
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            priceAtPurchase: products[0].price
          }
        ],
        subtotal: products[0].price * 2,
        tax: 0,
        discount: 0,
        total: products[0].price * 2,
        paymentMethod: "credit_card",
        status: "completed"
      },
      {
        orderId: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        customer: "Jane Smith",
        branch: "Branch 2",
        items: [
          {
            product: products[1]._id,
            quantity: 1,
            priceAtPurchase: products[1].price
          },
          {
            product: products[2]._id,
            quantity: 3,
            priceAtPurchase: products[2].price
          }
        ],
        subtotal: (products[1].price * 1) + (products[2].price * 3),
        tax: 0,
        discount: 5.00,
        total: (products[1].price * 1) + (products[2].price * 3) - 5.00,
        paymentMethod: "cash",
        status: "completed"
      }
    ];
    
    const created = await Order.insertMany(testOrders);
    res.json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get completed orders with product details
// Get completed orders with better error handling
router.get('/completed', async (req, res) => {
  try {
    const { branch } = req.query;
    
    // Validate MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const query = { 
      status: 'completed',
      ...(branch && { branch })
    };
    
    const orders = await Order.find(query)
      .populate({
        path: 'items.product',
        select: 'name price branch',
        match: { deleted: { $ne: true } } // Filter out deleted products
      })
      .populate({
        path: 'createdBy',
        select: 'name',
        options: { allowNull: true } // Handle case where createdBy doesn't exist
      })
      .sort({ createdAt: -1 })
      .lean();
    
    // Filter out orders with deleted products
   const validOrders = orders.filter(order => 
  order.items && Array.isArray(order.items) &&  // Add these checks
  order.items.every(item => item.product !== null)
);

    // Format response
    const formattedOrders = orders
  .filter(order =>
    order.items && Array.isArray(order.items) &&
    order.items.some(item => item.product !== null)
  )
  .map(order => ({
    id: order._id?.toString(),
    orderId: order.orderId,
    customer: order.customer,
    branch: order.branch,
    date: order.createdAt,
    status: order.status,
    total: order.total,
    paymentMethod: order.paymentMethod,
    items: order.items
      .filter(item => item.product !== null)
      .map(item => ({
        productId: item.product?._id?.toString(),
        productName: item.product?.name || 'Unknown Product',
        price: item.priceAtPurchase,
        quantity: item.quantity,
        subtotal: item.priceAtPurchase * item.quantity
      })),
    staff: order.createdBy?.name || 'System'
  }));

    res.json({
      success: true,
      data: formattedOrders
    });
    
  } catch (error) {
    handleError(res, error);
  }
});

// Create a new order with product validation
router.post('/', async (req, res) => {
  try {
    const { customer, branch, items, paymentMethod, notes } = req.body;
    
    // Validate required fields
    if (!customer || !branch || !items || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    // Validate each product exists and has sufficient stock
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== items.length) {
      return res.status(400).json({ message: 'One or more products not found' });
    }
    
    // Check stock and prepare order items
    const orderItems = [];
    const stockUpdates = [];
    
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product);
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });
      
      // Prepare stock updates
      stockUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -item.quantity } }
        }
      });
    }
    
    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => {
      return sum + (item.priceAtPurchase * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.1; // Example 10% tax
    const total = subtotal + tax;
    
    // Create order
    const order = new Order({
      orderId: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customer,
      branch,
      items: orderItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      notes,
      status: 'completed',
      createdBy: req.user?.id // Assuming you have auth middleware
    });
    
    // Start transaction for order creation and stock updates
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const savedOrder = await order.save({ session });
      await Product.bulkWrite(stockUpdates, { session });
      
      await session.commitTransaction();
      session.endSession();
      
      // Emit order creation event
      if (req.app.locals.io) {
        req.app.locals.io.emit('order-created', savedOrder);
      }
      
      res.status(201).json(savedOrder);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;