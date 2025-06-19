import express from 'express';
import Product from '../models/Product.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { branch } = req.query;
    const query = branch ? { branch } : {};
    
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const { name, price, stock, branch, minStock } = req.body;
    
    // Validation
    if (!name || !price || !branch || stock === undefined || minStock === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, price, branch, stock, minStock' 
      });
    }
    if (minStock > stock) {
      return res.status(400).json({
        message: 'Minimum stock level cannot be greater than current stock'
      });
    }

    const product = new Product(req.body);
    product.updateStatus();
    
    const savedProduct = await product.save();

    // Emit creation event
    if (req.app.locals.io) {
      req.app.locals.io.emit('product-created', {
        product: savedProduct.toObject()
      });
    }

    res.status(201).json(savedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: error.errors 
      });
    }
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const prevStock = product.stock;
    
    // Apply updates and recalculate status
    Object.assign(product, updates);
    product.updateStatus();
    
    const updatedProduct = await product.save();

    // Emit stock notification if needed
    if (product.stock <= product.minStock) {
  const notificationData  = {
    notification: {  // Wrap in notification object
      id: `stock-${product._id}-${Date.now()}`,
      title: product.stock === 0 ? 'Out of Stock' : 'Low Stock Alert',
      message: `${product.name} is ${product.stock === 0 ? 'out of' : 'low on'} stock (${product.stock} remaining)`,
      time: new Date(),
      type: product.stock === 0 ? 'error' : 'warning',
      productId: product._id.toString(),
      read: false
    }
  };

      // Save to database (if you have a notifications collection)
      await Notification.create(notificationData);
      
      // Emit to frontend
    req.app.locals.io.emit('new-notification', { notification: notificationData });
    }

    // Emit update events
    if (req.app.locals.io) {
      req.app.locals.io.emit('product-updated', {
        product: updatedProduct.toObject(),
        prevStock
      });
      
      // Emit to product-specific room
      req.app.locals.io.to(`product-${id}`).emit('product-updated', {
        product: updatedProduct.toObject(),
        prevStock
      });

      // Trigger stock alerts if needed
      if (updatedProduct.stock <= updatedProduct.minStock) {
        const alertType = updatedProduct.stock === 0 ? 'out-of-stock' : 'low-stock';
        req.app.locals.io.emit('stock-alert', {
          type: alertType,
          product: updatedProduct.toObject()
        });
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update product',
      error: error.message 
    });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Emit deletion event
    if (req.app.locals.io) {
      req.app.locals.io.emit('product-deleted', {
        productId: req.params.id
      });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete product',
      error: error.message 
    });
  }
});



// POST /api/products/test-data
router.post('/test-data', async (req, res) => {
  try {
    await Product.deleteMany({});
    
    const testProducts = [
      {
        name: "Wireless Keyboard",
        stock: 15,
        branch: "Branch 1",
        price: 49.99,
        minStock: 5
      },
      {
        name: "Wireless Mouse",
        stock: 8,
        branch: "Branch 2",
        price: 24.99,
        minStock: 10
      }
    ];
    
    const created = await Product.insertMany(testProducts);
    
    // Emit test data event
    if (req.app.locals.io) {
      req.app.locals.io.emit('test-data-loaded', {
        count: created.length
      });
    }

    res.json(created);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to load test data',
      error: error.message 
    });
  }
});

// POST /api/products/import
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const importedItems = await processCSV(req.file.path);
    const savedItems = await Product.insertMany(importedItems);
    
    // Emit import event
    if (req.app.locals.io) {
      req.app.locals.io.emit('products-imported', {
        count: savedItems.length
      });
    }

    res.json({ 
      success: true,
      importedItems: savedItems
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to import products',
      error: error.message 
    });
  }
});

export default router;