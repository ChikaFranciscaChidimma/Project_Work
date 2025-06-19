// server/services/chatbotService.js
import mongoose from 'mongoose';
import Product from '../../server/models/Product.js';
import Order from '../../server/models/Order.js';
import Sales from '../../server/models/Sales.js';


export const fetchBranchData = async (query, branch) => {
  try {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Inventory Analysis
    if (/inventory|stock|products?|items?/.test(normalizedQuery)) {
      const products = await Product.find({ branch }).lean();
      
      // Detailed stock analysis
      const stockAnalysis = products.reduce((acc, product) => {
        if (product.stock === 0) acc.outOfStock.push(product);
        else if (product.stock <= product.minStock) acc.lowStock.push(product);
        else acc.inStock.push(product);
        return acc;
      }, { inStock: [], lowStock: [], outOfStock: [] });
      
      // Calculate inventory value
      const totalInventoryValue = products.reduce(
        (sum, product) => sum + (product.price * product.stock), 0
      );
      
      // Identify top products by value
      const topProducts = [...products]
        .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
        .slice(0, 5);
      
      return {
        response: `📊 Inventory Analysis for ${branch}:\n` +
                 `• Total Products: ${products.length}\n` +
                 `• Inventory Value: $${totalInventoryValue.toFixed(2)}\n` +
                 `• In Stock: ${stockAnalysis.inStock.length} items\n` +
                 `• Low Stock: ${stockAnalysis.lowStock.length} items\n` +
                 `• Out of Stock: ${stockAnalysis.outOfStock.length} items\n\n` +
                 `🛒 Top Valuable Products:\n` +
                 stockAnalysis.inStock.slice(0, 5).map(p => 
                   `- ${p.name}: ${p.stock} @ $${p.price} (Value: $${(p.price*p.stock).toFixed(2)})`
                 ).join('\n'),
        data: {
          summary: {
            totalProducts: products.length,
            totalValue: totalInventoryValue,
            inStock: stockAnalysis.inStock.length,
            lowStock: stockAnalysis.lowStock.length,
            outOfStock: stockAnalysis.outOfStock.length
          },
          topProducts
        }
      };
    }
    
    // Order Analysis
 if (/orders?|transactions?|purchases?/.test(normalizedQuery)) {
  try {
    const timePeriod = normalizedQuery.includes('week') ? 7 : 
                     normalizedQuery.includes('month') ? 30 : 
                     normalizedQuery.includes('year') ? 365 : 30;
    
    // First check if any orders exist at all
    const hasAnyOrders = await Order.countDocuments({ branch });
    if (hasAnyOrders === 0) {
      return {
        response: `📦 No order records found for ${branch}.`,
        data: null
      };
    }

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - timePeriod);
    
    const [orders, orderStats] = await Promise.all([
      Order.find({ 
        branch,
        createdAt: { $gte: dateFilter },
        status: 'completed'
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('items.product', 'name price')
        .lean(),
      
      Order.aggregate([
        { $match: { 
          branch: branch,
          createdAt: { $gte: dateFilter },
          status: 'completed'
        }},
        { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }}
      ])
    ]);

    if (!orders || orders.length === 0) {
      return {
        response: `📦 No completed orders found for ${branch} in the last ${timePeriod} days.`,
        data: null
      };
    }
    
    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0
    };
    
    return {
      response: `📦 Order Analysis (Last ${timePeriod} days):\n` +
               `• Total Orders: ${stats.totalOrders}\n` +
               `• Total Revenue: $${stats.totalRevenue.toFixed(2)}\n` +
               `• Average Order Value: $${stats.avgOrderValue.toFixed(2)}\n\n` +
               `🆕 Recent Orders:\n` +
              orders.map(o => `- #${o.orderId}: $${o.total?.toFixed(2) ?? 'N/A'} (${o.items ? o.items.length : 0} items)`).join('\n'),
      data: {
        summary: stats,
        recentOrders: orders
      }
    };
  } catch (error) {
    console.error('Order analysis error:', error);
    return {
      response: `⚠️ Could not retrieve order data due to a technical error.`,
      data: null,
      error: error.message
    };
  }
}

    
    // Sales Analysis
 if (/sales|revenue|income/.test(normalizedQuery)) {
  try {
    const period = normalizedQuery.includes('daily') ? 'day' :
                  normalizedQuery.includes('weekly') ? 'week' :
                  normalizedQuery.includes('monthly') ? 'month' : 'week';
    
    // First check if any sales exist at all
    const hasAnySales = await Sales.countDocuments({ branch });
    if (hasAnySales === 0) {
      return {
        response: `💰 No sales records found for ${branch}.`,
        data: null
      };
    }

    const salesData = await Sales.aggregate([
      { $match: { branch: branch} },
      { $group: {
        _id: {
          [period === 'day' ? '$dayOfYear' : 
           period === 'week' ? '$week' : 
           '$month']: '$date'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': -1 } },
      { $limit: 7 }
    ]);

    if (!salesData || salesData.length === 0) {
      return {
        response: `💰 No sales data available for the selected period (${period}) in ${branch}.`,
        data: null
      };
    }

    const totalSales = salesData.reduce((sum, day) => sum + day.total, 0);
    
    return {
      response: `💰 Sales Trend (Last 7 ${period}s):\n` +
               `• Total Sales: $${totalSales.toFixed(2)}\n` +
               `• Average Daily: $${(totalSales/7).toFixed(2)}\n\n` +
               salesData.map(s => `• ${period} ${s._id}: $${s.total.toFixed(2)} (${s.count} sales)`)
                 .join('\n'),
      data: {
        period,
        totalSales,
        dailyAverage: totalSales/7,
        trend: salesData
      }
    };
  } catch (error) {
    console.error('Sales analysis error:', error);
    return {
      response: `⚠️ Could not retrieve sales data due to a technical error.`,
      data: null,
      error: error.message
    };
  }
}


    
    // Default response with examples
    return {
      response: "🤖 I can provide detailed analysis on:\n\n" +
               "📊 Inventory:\n" +
               "- 'Show inventory status for branch X'\n" +
               "- 'What products are low in stock?'\n" +
               "- 'What's our total inventory value?'\n\n" +
               "📦 Orders:\n" +
               "- 'Show recent orders for branch X'\n" +
               "- 'What's our average order value this month?'\n" +
               "- 'How many orders did we process last week?'\n\n" +
               "💰 Sales:\n" +
               "- 'Show weekly sales trend'\n" +
               "- 'Compare monthly sales'\n" +
               "- 'What's our total revenue this quarter?'",
      data: null
    };
    
  } catch (error) {
    console.error('Chatbot service error:', error);
    return {
      response: "⚠️ Sorry, I encountered an error processing your request. " +
               "Please try again later or contact support.",
      data: null,
      error: error.message
    };
  }
};