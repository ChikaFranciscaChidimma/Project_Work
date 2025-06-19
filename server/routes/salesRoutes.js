import express from 'express';
import Sale from '../models/Sales.js';

const router = express.Router();

// Get sales data by period
router.get('/', async (req, res) => {
  try {
    const { period } = req.query;
    let salesData;
    
    if (period === 'weekly') {
      // Group by day of week
      salesData = await Sale.aggregate([
        { 
          $group: {
            _id: { $dayOfWeek: "$date" },
            total: { $sum: "$amount" },
            online: { $sum: { $cond: [{ $eq: ["$type", "online"] }, "$amount", 0] } },
            inStore: { $sum: { $cond: [{ $eq: ["$type", "instore"] }, "$amount", 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Map to your frontend format
      salesData = salesData.map(item => ({
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item._id - 1],
        Total: item.total,
        OnlineOrders: item.online,
        InStoreOrders: item.inStore
      }));
    }
    
    res.json(salesData || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;