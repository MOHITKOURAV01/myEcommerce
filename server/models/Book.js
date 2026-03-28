const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Other'],
    default: 'English',
  },
  description: {
    type: String,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  coverUrl: {
    type: String,
    default: '',
  },
  coverThumb: {
    type: String,
    default: '',
  },
  publisher: {
    type: String,
    trim: true,
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Invalid year'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1'],
  },
  edition: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  moods: [{
    type: String,
    trim: true,
  }],
  problems: [{
    type: String,
    trim: true,
  }],
  readingLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
  },
  readingTime: {
    type: String,
    trim: true,
  },
  why: {
    type: String,
    maxlength: [1000, 'Why field cannot exceed 1000 characters'],
  },
  shouldRead: {
    type: String,
    maxlength: [2000, 'Should read cannot exceed 2000 characters'],
  },
  shouldNot: {
    type: String,
    maxlength: [1000, 'Should not cannot exceed 1000 characters'],
  },
  outcome: {
    type: String,
    maxlength: [1000, 'Outcome cannot exceed 1000 characters'],
  },
  readingPaths: [{
    type: String,
    trim: true,
  }],
  amazonLink: {
    type: String,
    trim: true,
  },
  flipkartLink: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  bestseller: {
    type: Boolean,
    default: false,
  },
  newArrival: {
    type: Boolean,
    default: false,
  },
  trending: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  openLibraryKey: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Text index for full-text search
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  tags: 'text',
}, {
  weights: { title: 10, author: 5, tags: 3, description: 1 },
  name: 'book_text_search',
});

// Compound indexes for filtering
bookSchema.index({ category: 1, language: 1, moods: 1 });
bookSchema.index({ price: 1, rating: -1, featured: 1 });
bookSchema.index({ featured: 1, bestseller: 1, trending: 1, newArrival: 1 });

// Auto-generate slug from title
bookSchema.pre('save', async function() {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  // Auto-calculate inStock
  this.inStock = this.stock > 0;
  // Auto-calculate discount
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
});

// Virtual: reviews
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
});

module.exports = mongoose.model('Book', bookSchema);
