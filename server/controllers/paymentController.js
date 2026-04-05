const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');

// Helper to calc cart totals accurately server-side to prevent tampering
const calculateTotals = (cart) => {
  const subtotal = cart.items.reduce((acc, item) => {
    const price = item.price || (item.book ? item.book.price : 0);
    return acc + (price * item.quantity);
  }, 0);
  let couponDiscount = 0;

  if (cart.appliedCoupon && subtotal >= cart.appliedCoupon.minOrderValue) {
    if (cart.appliedCoupon.type === 'percent') {
      let discount = (subtotal * cart.appliedCoupon.value) / 100;
      if (cart.appliedCoupon.maxDiscount && discount > cart.appliedCoupon.maxDiscount) {
        discount = cart.appliedCoupon.maxDiscount;
      }
      couponDiscount = Math.round(discount);
    } else {
      couponDiscount = cart.appliedCoupon.value;
    }
  }

  // Ensure discount doesn't exceed subtotal
  couponDiscount = Math.min(couponDiscount, subtotal);

  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const tax = Math.round((subtotal - couponDiscount) * 0.18);
  const total = subtotal - couponDiscount + shipping + tax;

  return { subtotal, couponDiscount, shipping, tax, total };
};

// @desc    Create Payment Intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('appliedCoupon');
  
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  const { total } = calculateTotals(cart);
  
  if (total <= 0) {
    res.status(400);
    throw new Error('Invalid cart total calculation');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total * 100, // Amount in paise
    currency: 'inr',
    metadata: {
      userId: req.user._id.toString(),
      cartId: cart._id.toString(),
    },
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Confirm Payment & Create Order
// @route   POST /api/payment/confirm
// @access  Private
const confirmPaymentAndCreateOrder = asyncHandler(async (req, res) => {
  const { paymentIntentId, shippingAddress } = req.body;

  if (!paymentIntentId || !shippingAddress) {
    res.status(400);
    throw new Error('Please provide payment confirmation info and shipping address');
  }

  // Idempotency Check: Don't process same payment intent twice
  const existingOrder = await Order.findOne({ 'payment.stripePaymentIntentId': paymentIntentId });
  if (existingOrder) {
    return res.status(200).json({ success: true, data: existingOrder });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== 'succeeded') {
    res.status(400);
    throw new Error(`Payment verification failed: Status is ${paymentIntent.status}`);
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.book', 'title author coverUrl').populate('appliedCoupon');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty or already processed');
  }

  const totals = calculateTotals(cart);

  const orderItems = cart.items.map(item => ({
    book: item.book._id,
    title: item.book.title,
    author: item.book.author,
    coverUrl: item.book.coverUrl,
    price: item.price,
    quantity: item.quantity
  }));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    payment: {
      method: 'stripe',
      status: 'paid',
      transactionId: paymentIntent.charges.data[0]?.id || paymentIntent.id,
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentId
    },
    pricing: {
      subtotal: totals.subtotal,
      couponDiscount: totals.couponDiscount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.MathRoundTotal
    },
    coupon: cart.appliedCoupon ? cart.appliedCoupon._id : undefined,
    status: 'confirmed'
  });

  // Decrement stock operations
  for (const item of cart.items) {
    const bookToUpdate = await Book.findById(item.book._id);
    if (bookToUpdate && bookToUpdate.stock >= item.quantity) {
      bookToUpdate.stock -= item.quantity;
      await bookToUpdate.save();
    }
  }

  // Clear cart
  cart.items = [];
  cart.appliedCoupon = undefined;
  await cart.save();

  // Send Order Confirmation Email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `orderConfirmationEmail` // Dummy for now, actual implementation handles formatting inside sendEmail.js
    });
  } catch (error) {
    console.error('Email failed to send post order-creation', error);
  }

  res.status(201).json({ success: true, data: order });
});

// @desc    Create COD Order
// @route   POST /api/payment/cod
// @access  Private
const createCODOrder = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  let { shippingAddress } = req.body;

  // Resolve address from ID if provided
  if (!shippingAddress && addressId) {
    const address = req.user.addresses.find(a => a._id.toString() === addressId.toString());
    if (address) {
      shippingAddress = address.toObject();
    }
  }

  if (!shippingAddress) {
    res.status(400);
    throw new Error('Please provide shipping address');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.book', 'title author coverUrl price').populate('appliedCoupon');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  const totals = calculateTotals(cart);

  const orderItems = cart.items.map(item => ({
    book: item.book._id,
    title: item.book.title,
    author: item.book.author,
    coverUrl: item.book.coverUrl,
    price: item.price || item.book.price,
    quantity: item.quantity
  }));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    payment: {
      method: 'cod',
      status: 'pending'
    },
    pricing: {
      subtotal: totals.subtotal || 0,
      discount: 0,
      couponDiscount: totals.couponDiscount || 0,
      shipping: totals.shipping || 0,
      tax: totals.tax || 0,
      total: totals.total || 0,
    },
    coupon: cart.appliedCoupon ? cart.appliedCoupon._id : undefined,
    status: 'placed'
  });


  // Decrement stock operations
  for (const item of cart.items) {
    const bookToUpdate = await Book.findById(item.book._id);
    if (bookToUpdate && bookToUpdate.stock >= item.quantity) {
      bookToUpdate.stock -= item.quantity;
      await bookToUpdate.save();
    }
  }

  // Clear cart
  cart.items = [];
  cart.appliedCoupon = undefined;
  await cart.save();

  // Send Order Confirmation
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: `orderConfirmationEmail` // Will be mapped inside sendEmail handler based on subject mapping or params
    });
  } catch (error) {
    console.error('Email failed: ', error);
  }

  res.status(201).json({ success: true, data: order });
});

// @desc    Stripe webhook handler
// @route   POST /webhook/stripe
// @access  Public (webhook)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body is explicitly raw buffer handled by express.raw() in server.js
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Find if order exists, marks status to paid
    await Order.findOneAndUpdate(
      { 'payment.stripePaymentIntentId': paymentIntent.id },
      { 
        $set: { 
          'payment.status': 'paid', 
          'payment.paidAt': new Date(),
          status: 'confirmed'
        }
      }
    );
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Order.findOneAndUpdate(
      { 'payment.stripePaymentIntentId': paymentIntent.id },
      { $set: { 'payment.status': 'failed' } }
    );
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

module.exports = {
  createPaymentIntent,
  confirmPaymentAndCreateOrder,
  createCODOrder,
  stripeWebhook
};
