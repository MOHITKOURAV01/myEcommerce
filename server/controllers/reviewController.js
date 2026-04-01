const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiFeatures = require('../utils/apiFeatures');

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
  // We'll calculate the len of helpful array for sort or just sort by helpful directly if using aggregation or sort
  // Since 'helpful' is an array, MongoDB sort on array isn't straight forward for "length".
  // A simple approximation natively is to sort by 'rating' or 'createdAt' unless we aggregated it.
  // The Review schema could have a helpfulCount, but we'll sort by helpful size by using an aggregation here.
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.aggregate([
    { $match: { book: require('mongoose').Types.ObjectId.createFromHexString(req.params.bookId) } },
    { $addFields: { helpfulCount: { $size: { $ifNull: ['$helpful', []] } } } },
    { $sort: { helpfulCount: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $project: { 'user.password': 0, 'user.email': 0 } }
  ]);

  const total = await Review.countDocuments({ book: req.params.bookId });

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: reviews
  });
});

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { book, rating, title, comment } = req.body;

  // Check if book exists
  const bookExists = await Book.findById(book);
  if (!bookExists) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = await Review.findOne({ book, user: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this book');
  }

  // Check if user actually purchased it (Order status Delivered)
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'items.book': book,
    orderStatus: 'Delivered'
  });

  if (!hasPurchased) {
    res.status(403);
    throw new Error('You can only review books you have purchased and received');
  }

  const review = await Review.create({
    user: req.user._id,
    book,
    rating,
    title,
    comment
  });

  await updateBookRating(book);

  res.status(201).json({ success: true, data: review });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

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
