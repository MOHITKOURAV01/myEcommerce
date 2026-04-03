const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  title: { type: String, required: true },
  author: { type: String },
  coverUrl: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, max: 10 },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderNumber: {
    type: String,
    unique: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Order must have at least one item'],
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'cod', 'upi', 'netbanking'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: String,
    paidAt: Date,
    stripePaymentIntentId: String,
  },
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'placed',
  },
  statusHistory: [statusHistorySchema],
  tracking: {
    carrier: String,
    trackingId: String,
    url: String,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
  cancelReason: String,
  returnReason: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// Auto-generate orderNumber: BSM-YYYY-XXXXXX
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `BSM-${year}-${randomPart}`;
  }
  // Push status to history
  if (this.isModified('status') || this.isNew) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  // Mark delivered
  if (this.status === 'delivered' && !this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
});

module.exports = mongoose.model('Order', orderSchema);
