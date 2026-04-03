const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters'],
  },
  body: {
    type: String,
    trim: true,
    maxlength: [2000, 'Review body cannot exceed 2000 characters'],
  },
  images: [{
    type: String,
  }],
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// One review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });
reviewSchema.index({ book: 1, rating: -1 });

// Static: calculate avg rating after save/remove
reviewSchema.statics.calcAverageRating = async function(bookId) {
  const stats = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);
  const Book = mongoose.model('Book');
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, { rating: 0, numReviews: 0 });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.book);
});

reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) doc.constructor.calcAverageRating(doc.book);
});

module.exports = mongoose.model('Review', reviewSchema);
