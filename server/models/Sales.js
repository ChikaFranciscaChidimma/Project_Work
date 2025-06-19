import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  saleId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  products: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    priceAtSale: { 
      type: Number, 
      required: true 
    }
  }],
  customer: { 
    type: String, 
    required: true 
  },
  branch: { 
    type: String, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'other'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  saleType: {
    type: String,
    enum: ['instore', 'online', 'wholesale'],
    required: true
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  transactionHash: { 
    type: String 
  }, // For blockchain integration
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Add text index for search functionality
saleSchema.index({
  saleId: 'text',
  customer: 'text',
  branch: 'text'
});

// Pre-save hook to generate saleId
saleSchema.pre('save', function(next) {
  if (!this.saleId) {
    this.saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);