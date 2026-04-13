const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// Helper to update book rating
const updateBookRating = async (bookId) => {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        rating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round(stats[0].rating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getBookReviews = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const reviews = await Review.find({ book: req.params.bookId })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip((page-1)*limit)
    .limit(limit);
  const total = await Review.countDocuments({ book: req.params.bookId });
  res.json({ success: true, data: reviews, total, page, totalPages: Math.ceil(total/limit) });
});

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { book, rating, title, body } = req.body;
  if (!book || !rating) { res.status(400); throw new Error('Book and rating required'); }

  // One review per user per book
  const existing = await Review.findOne({ book, user: req.user._id });
  if (existing) { res.status(400); throw new Error('You have already reviewed this book'); }

  const review = await Review.create({ book, user: req.user._id, rating, title, body });
  await review.populate('user', 'name avatar');

  // Update book rating
  const mongoose = require('mongoose');
  const stats = await Review.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(book) } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
  ]);
  await Book.findByIdAndUpdate(book, {
    rating: parseFloat(stats[0]?.avgRating.toFixed(1)) || 0,
    numReviews: stats[0]?.numReviews || 0,
  });

  res.status(201).json({ success: true, data: review });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this review');
  }

  review.rating = req.body.rating || review.rating;
  review.title = req.body.title || review.title;
  review.comment = req.body.comment || review.comment;

  await review.save();
  await updateBookRating(review.book);

  res.status(200).json({ success: true, data: review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  const bookId = review.book;
  await review.deleteOne();
  await updateBookRating(bookId);

  res.status(200).json({ success: true, message: 'Review deleted' });
});

// @desc    Toggle helpful vote
// @route   POST /api/reviews/:id/helpful
// @access  Private
const toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const index = review.helpful.indexOf(req.user._id);

  if (index === -1) {
    review.helpful.push(req.user._id);
  } else {
    review.helpful.splice(index, 1);
  }

  await review.save();
  res.status(200).json({ success: true, data: review });
});

module.exports = {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful
};
