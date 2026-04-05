const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('books', 'title coverUrl price rating numReviews slug author');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, books: [] });
  }

  res.status(200).json({ success: true, count: wishlist.books.length, data: wishlist });
});

// @desc    Toggle book in wishlist
// @route   POST /api/wishlist/:bookId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, books: [] });
  }

  const index = wishlist.books.indexOf(bookId);
  let action = '';

  if (index === -1) {
    wishlist.books.push(bookId);
    action = 'added';
  } else {
    wishlist.books.splice(index, 1);
    action = 'removed';
  }

  await wishlist.save();
  await wishlist.populate('books', 'title coverUrl price rating numReviews slug author');

  res.status(200).json({ success: true, action, data: wishlist });
});

// @desc    Remove book from wishlist
// @route   DELETE /api/wishlist/:bookId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  const index = wishlist.books.indexOf(bookId);
  if (index !== -1) {
    wishlist.books.splice(index, 1);
    await wishlist.save();
  }

  await wishlist.populate('books', 'title coverUrl price rating numReviews slug author');

  res.status(200).json({ success: true, data: wishlist });
});

// @desc    Move book from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:bookId
// @access  Private
const moveToCart = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  // 1. Remove from Wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  const index = wishlist.books.indexOf(bookId);
  if (index === -1) {
    res.status(400);
    throw new Error('Book not found in wishlist');
  }

  wishlist.books.splice(index, 1);
  await wishlist.save();

  // 2. Add to Cart
  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book no longer exists');
  }

  if (book.stock < 1) {
    res.status(400);
    throw new Error('Book is currently out of stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const cartItemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
  if (cartItemIndex > -1) {
    const newQty = cart.items[cartItemIndex].quantity + 1;
    if (newQty <= 10 && newQty <= book.stock) {
      cart.items[cartItemIndex].quantity = newQty;
    }
  } else {
    cart.items.push({
      book: bookId,
      quantity: 1,
      price: book.price
    });
  }

  await cart.save();

  await wishlist.populate('books', 'title coverUrl price rating numReviews slug author');
  
  res.status(200).json({
    success: true,
    message: 'Moved to cart successfully',
    wishlist: wishlist
  });
});

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart
};
