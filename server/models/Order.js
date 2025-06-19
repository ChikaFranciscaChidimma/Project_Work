import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1
  },
  priceAtPurchase: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  customer: { 
    type: String, 
    required: true 
  },
  branch: { 
    type: String, 
    required: true 
  },
  items: [orderItemSchema],
  subtotal: { 
    type: Number, 
    required: true 
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: { 
    type: Number, 
    required: true 
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'mobile_payment'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make this optional if you don't have User model
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
    this.total = this.subtotal + this.tax - this.discount;
  }
  next();
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);