const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .populate('items.book', 'title author coverUrl')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: orders
  });
});

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.book', 'title author coverUrl')
    .populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Admin can view any order, User can only view their own
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({ success: true, data: order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to modify this order');
  }

  if (!['placed', 'confirmed'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order physically in state: ${order.status}`);
  }

  order.status = 'cancelled';
  order.cancelReason = req.body.cancelReason || 'Cancelled by user';
  // Pre-save hook automatically logs history

  // Process manual refund or marking logic if it was a paid stripe order
  if (order.payment.status === 'paid') {
    order.payment.status = 'refunded';
  }

  await order.save();

  try {
    await sendEmail({
      to: req.user.email || order.user.email,
      subject: `Order Cancelled - ${order.orderNumber}`,
      html: `orderCancelledEmail` 
    });
  } catch (error) {
    console.error('Email sending failed', error);
  }

  res.status(200).json({ success: true, data: order });
});

// @desc    Return order
// @route   POST /api/orders/:id/return
// @access  Private
const returnOrder = asyncHandler(async (req, res) => {
  const { returnReason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.isDelivered) {
    res.status(400);
    throw new Error('Cannot process return for an item that is not marked as delivered');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to return this order');
  }

  // Update status
  order.status = 'returned';
  order.returnReason = returnReason || 'Not specified by user';
  await order.save();

  res.status(200).json({ success: true, data: order });
});

// @desc    Track order
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
    .select('orderNumber status statusHistory tracking isDelivered deliveredAt createdAt shippingAddress');

  if (!order) {
    res.status(404);
    throw new Error('Order tracking number not found');
  }

  res.status(200).json({ success: true, data: order });
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.status) query.status = req.query.status;
  if (req.query.user) query.user = req.query.user;
  if (req.query.date) {
    query.createdAt = {
      $gte: new Date(req.query.date),
      $lt: new Date(new Date(req.query.date).getTime() + 24 * 60 * 60 * 1000)
    };
  }

  const features = new ApiFeatures(Order.find(query).populate('user', 'name email'), req.query)
    .sort()
    .paginate();

  const orders = await features.query;
  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    page: features.page,
    totalPages: Math.ceil(total / features.limit),
    count: orders.length,
    data: orders
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status metric provided');
  }

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  await order.save(); // Model hook handles history and isDelivered logic

  // Dynamic email trigger based on new status
  try {
    if (status === 'shipped') {
      await sendEmail({
        to: order.user.email,
        subject: `Your order ${order.orderNumber} has shipped!`,
        html: `orderShippedEmail`
      });
    } else if (status === 'delivered') {
      await sendEmail({
        to: order.user.email,
        subject: `Order Delivered - ${order.orderNumber}`,
        html: `orderDeliveredEmail`
      });
    } else if (status === 'cancelled') {
        await sendEmail({
          to: order.user.email,
          subject: `Order Cancelled - ${order.orderNumber}`,
          html: `orderCancelledEmail`
        });
    }
  } catch (error) {
    console.error('Email dispatch failure upon status update', error);
  }

  res.status(200).json({ success: true, data: order });
});

// @desc    Update order tracking detail
// @route   PUT /api/admin/orders/:id/tracking
// @access  Private/Admin
const updateOrderTracking = asyncHandler(async (req, res) => {
  const { carrier, trackingId, url } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.tracking = {
    carrier: carrier || order.tracking.carrier,
    trackingId: trackingId || order.tracking.trackingId,
    url: url || order.tracking.url
  };

  // If adding tracking, implicitly could mean shipped depending on workflow, but we won't mutate status directly unless explicitly asked or desired.
  await order.save();

  res.status(200).json({ success: true, data: order });
});

module.exports = {
  getMyOrders,
  getOrder,
  cancelOrder,
  returnOrder,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking
};
