const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// Local calculation helper
const calcCartTotals = (items, coupon = null) => {
  const subtotal = items.reduce((acc, item) => {
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

const seedData = require('../data/seedData');
// Sync with bookController mapping
const mockBooks = seedData.map((b, i) => ({ ...b, _id: i.toString() }));

// --- Mock Store for development without MongoDB ---
const MOCK_CARTS = new Map(); // userId -> cart object

const getMockCart = (userId) => {
  if (!MOCK_CARTS.has(userId)) {
    MOCK_CARTS.set(userId, { items: [], appliedCoupon: null });
  }
  const cart = MOCK_CARTS.get(userId);
  
  // Populate items with full book data from mockBooks for the frontend
  const populatedItems = cart.items.map(item => {
    const book = mockBooks.find(b => 
        b._id === item.bookId || 
        b.isbn === item.bookId || 
        (b.slug && b.slug === item.bookId) ||
        (b.title && item.bookId && b.title.toLowerCase().includes(item.bookId.toLowerCase()))
    );
    return {
      ...item,
      book: book || { title: 'Book Loading...', price: item.price, coverUrl: '' }
    };
  });

  const totals = calcCartTotals(populatedItems, cart.appliedCoupon);
  return { ...cart, items: populatedItems, ...totals };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true') {
    const cart = getMockCart(req.user._id);
    return res.status(200).json({ success: true, data: cart });
  }

  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.book', 'title coverUrl price stock slug author');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  if (cart.appliedCoupon) {
    await cart.populate('appliedCoupon');
  }

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

  if (process.env.USE_MOCK_DATA === 'true') {
    const cart = MOCK_CARTS.get(req.user._id) || { items: [], appliedCoupon: null };
    const book = mockBooks.find(b => b._id === bookId || b.slug === bookId);
    
    if (!book) {
      res.status(404);
      throw new Error('Book not found in archives');
    }

    const existingIdx = cart.items.findIndex(i => i.bookId === bookId);
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        bookId,
        quantity,
        price: book.price
      });
    }
    
    MOCK_CARTS.set(req.user._id, cart);
    const populated = getMockCart(req.user._id);
    return res.status(200).json({ success: true, data: populated });
  }

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
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (newQty > 10) {
      res.status(400);
      throw new Error('Maximum quantity per item is 10');
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      book: bookId,
      quantity,
      price: book.price
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

  if (process.env.USE_MOCK_DATA === 'true') {
     const cart = MOCK_CARTS.get(req.user._id);
     const item = cart?.items.find(i => i.bookId === bookId);
     if (item) {
        item.quantity = quantity;
        MOCK_CARTS.set(req.user._id, cart);
     }
     return res.status(200).json({ success: true, data: getMockCart(req.user._id) });
  }

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
  if (process.env.USE_MOCK_DATA === 'true') {
    const cart = MOCK_CARTS.get(req.user._id);
    if (cart) {
        cart.items = cart.items.filter(i => i.bookId !== req.params.bookId);
        MOCK_CARTS.set(req.user._id, cart);
    }
    return res.status(200).json({ success: true, data: getMockCart(req.user._id) });
  }

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
  if (process.env.USE_MOCK_DATA === 'true') {
    MOCK_CARTS.set(req.user._id, { items: [], appliedCoupon: null });
    return res.status(200).json({ success: true, data: { items: [], subtotal: 0, total: 0 } });
  }

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
