const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// Local calculation helper
const calcCartTotals = (items, coupon = null) => {
  let subtotal = items.reduce((acc, item) => {
    const price = item.price || (item.book ? item.book.price : 0);
    return acc + (price * item.quantity);
  }, 0);
  let couponDiscount = 0;

  if (coupon && subtotal >= coupon.minOrderValue) {
    if (coupon.type === 'percent') {
      let discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      couponDiscount = Math.round(discount);
    } else {
      couponDiscount = coupon.value;
    }
  }

  // Ensure discount doesn't exceed subtotal
  couponDiscount = Math.min(couponDiscount, subtotal);

  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const tax = Math.round((subtotal - couponDiscount) * 0.18);
  const total = subtotal - couponDiscount + shipping + tax;

  return { subtotal, couponDiscount, shipping, tax, total };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.book', 'title coverUrl price stock slug author');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Populate coupon if applied
  if (cart.appliedCoupon) {
    await cart.populate('appliedCoupon');
  }

  // Recalculate totals dynamically
  const totals = calcCartTotals(cart.items, cart.appliedCoupon);

  res.status(200).json({
    success: true,
    data: {
      ...cart.toObject(),
      ...totals
    }
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity = 1 } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.stock < quantity) {
    res.status(400);
    throw new Error('Requested quantity exceeds available stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

  if (existingItemIndex > -1) {
    // Increment quantity, check limits
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (newQty > 10) {
      res.status(400);
      throw new Error('Maximum quantity per item is 10');
    }
    if (newQty > book.stock) {
      res.status(400);
      throw new Error('Requested quantity exceeds available stock');
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      book: bookId,
      quantity,
      price: book.price // freeze price at time of adding
    });
  }

  await cart.save();
  await cart.populate('items.book', 'title coverUrl price stock slug author');
  if (cart.appliedCoupon) await cart.populate('appliedCoupon');

  const totals = calcCartTotals(cart.items, cart.appliedCoupon);

  res.status(200).json({
    success: true,
    data: { ...cart.toObject(), ...totals }
  });
});

// @desc    Update item quantity
// @route   PUT /api/cart/:bookId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const bookId = req.params.bookId;

  if (quantity < 1 || quantity > 10) {
    res.status(400);
    throw new Error('Quantity must be between 1 and 10');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find(item => item.book.toString() === bookId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  const book = await Book.findById(bookId);
  if (quantity > book.stock) {
    res.status(400);
    throw new Error('Requested quantity exceeds available stock');
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.book', 'title coverUrl price stock slug author');
  if (cart.appliedCoupon) await cart.populate('appliedCoupon');

  const totals = calcCartTotals(cart.items, cart.appliedCoupon);

  res.status(200).json({
    success: true,
    data: { ...cart.toObject(), ...totals }
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item.book.toString() !== req.params.bookId);
  await cart.save();
  await cart.populate('items.book', 'title coverUrl price stock slug author');
  if (cart.appliedCoupon) await cart.populate('appliedCoupon');

  const totals = calcCartTotals(cart.items, cart.appliedCoupon);

  res.status(200).json({
    success: true,
    data: { ...cart.toObject(), ...totals }
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.appliedCoupon = undefined;
    await cart.save();
  }

  res.status(200).json({ success: true, data: { items: [], subtotal: 0, total: 0 } });
});

// @desc    Apply coupon
// @route   POST /api/cart/apply-coupon
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  if (new Date() > new Date(coupon.validTo)) {
    res.status(400);
    throw new Error('Coupon has expired');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const totals = calcCartTotals(cart.items, coupon);
  if (totals.subtotal < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`Minimum order amount for this coupon is ₹${coupon.minOrderValue}`);
  }

  cart.appliedCoupon = coupon._id;
  await cart.save();
  await cart.populate('items.book', 'title coverUrl price stock slug author');
  await cart.populate('appliedCoupon');

  const finalTotals = calcCartTotals(cart.items, cart.appliedCoupon);

  res.status(200).json({
    success: true,
    data: { ...cart.toObject(), ...finalTotals }
  });
});


// @desc    Remove coupon
// @route   DELETE /api/cart/remove-coupon
// @access  Private
const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.appliedCoupon = undefined;
    await cart.save();
    await cart.populate('items.book', 'title coverUrl price stock slug author');
    const totals = calcCartTotals(cart.items, null);
    
    return res.status(200).json({
      success: true,
      data: { ...cart.toObject(), ...totals }
    });
  }

  res.status(404);
  throw new Error('Cart not found');
});

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
const getCartCount = asyncHandler(async (req, res) => {
  // Ideally cached in Redis, falling back to DB for simple implementation
  const cart = await Cart.findOne({ user: req.user._id });
  const count = cart ? cart.items.length : 0;
  
  res.status(200).json({ success: true, count });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartCount,
  calcCartTotals // Exported for unit testing
};
