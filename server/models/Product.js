import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  branch: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  minStock: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["In Stock", "Low Stock", "Out of Stock"],
    default: "In Stock"
  }
}, { 
   timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.status = calculateStatus(ret.stock, ret.minStock);
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.status = calculateStatus(ret.stock, ret.minStock);
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Helper function for status calculation
function calculateStatus(stock, minStock) {
  if (stock === 0) return "Out of Stock";
  if (stock <= minStock) return "Low Stock";
  return "In Stock";
}

productSchema.post('save', function(doc) {
  // Explicitly save the status if it was calculated
  if (this.isModified('stock') || this.isModified('minStock')) {
    this.status = this.constructor.getStatus(this.stock, this.minStock);
    this.save(); // This will trigger another save but only if needed
  }
});

// Add pre-save hook
productSchema.pre('save', function(next) {
  if (this.isModified('stock') || this.isModified('minStock')) {
    this.status = this.constructor.getStatus(this.stock, this.minStock);
  }
  next();
});

productSchema.methods.updateStatus = function() {
  this.status = getStatus(this.stock, this.minStock);
  return this;
};

productSchema.statics.getStatus = function(stock, minStock) {
  if (stock === 0) return "Out of Stock";
  if (stock <= minStock) return "Low Stock";
  return "In Stock";
};

productSchema.methods.updateStatus = function() {
  this.status = this.constructor.getStatus(this.stock, this.minStock);
  return this;
};

productSchema.pre('save', function(next) {
  this.status = this.constructor.getStatus(this.stock, this.minStock);
  next();
});

productSchema.post('save', function(doc) {
  if (this.stock === 0 && this.wasNew) {
    // Skip alert for newly created out-of-stock items
    return;
  }

  if (this.stock <= this.minStock) {
    const io = require('socket.io')();
    const alertType = this.stock === 0 ? 'out-of-stock' : 'low-stock';
    
    io.emit('stock-alert', {
      type: alertType,
      product: this.toObject()
    });
  }
});

// Remove the method version - we'll use the helper function everywhere
export default mongoose.model('Product', productSchema);