const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['percent', 'fixed'],
    required: [true, 'Coupon type is required'],
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Value cannot be negative'],
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value cannot be negative'],
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Max discount cannot be negative'],
  },
  usageLimit: {
    type: Number,
    default: null,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validTo: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index
couponSchema.index({ validTo: 1, isActive: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function(userId, orderTotal) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (now < this.validFrom) return { valid: false, message: 'Coupon is not yet active' };
  if (now > this.validTo) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (this.usedBy.includes(userId)) return { valid: false, message: 'You have already used this coupon' };
  if (orderTotal < this.minOrderValue) return { valid: false, message: `Minimum order value is ₹${this.minOrderValue}` };
  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(orderTotal) {
  let discount = 0;
  if (this.type === 'percent') {
    discount = (orderTotal * this.value) / 100;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.value;
  }
  return Math.min(discount, orderTotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
