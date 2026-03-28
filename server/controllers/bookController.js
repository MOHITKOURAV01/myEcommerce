const Book = require('../models/Book');
const Category = require('../models/Category');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiFeatures = require('../utils/apiFeatures');
const { client: redis } = require('../utils/redis');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const seedData = require('../data/seedData');
const mockBooks = seedData.map((b, i) => ({ ...b, _id: i.toString(), category: { name: b.category, slug: b.category } }));

const getBooks = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    return res.status(200).json({ 
      success: true, 
      total: mockBooks.length, 
      page: 1, 
      totalPages: 1, 
      count: mockBooks.length, 
      data: mockBooks 
    });
  }

  // 1. Build initial features to get accurate total
  const features = new ApiFeatures(Book.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const total = await Book.countDocuments(features.filters && Object.keys(features.filters).length > 0 ? features.filters : {});

  const books = await features.query.populate('category', 'name slug');

  res.status(200).json({
    success: true,
    total,
    page: features.page,
    totalPages: Math.ceil(total / features.limit),
    count: books.length,
    data: books,
  });
});

const getFeaturedBooks = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    const featured = mockBooks.filter(b => b.featured).slice(0, 5);
    return res.status(200).json({ success: true, count: featured.length, data: featured });
  }
  const books = await Book.find({ featured: true }).populate('category', 'name slug');
  res.status(200).json({ success: true, count: books.length, data: books });
});

const getTrendingBooks = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    const trending = mockBooks.filter(b => b.trending).slice(0, 5);
    return res.status(200).json({ success: true, count: trending.length, data: trending });
  }
  const books = await Book.find({ trending: true }).sort('-rating').populate('category', 'name slug');
  res.status(200).json({ success: true, count: books.length, data: books });
});

const getNewArrivals = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    const latest = mockBooks.filter(b => b.newArrival).slice(0, 5);
    return res.status(200).json({ success: true, count: latest.length, data: latest });
  }
  const books = await Book.find({ newArrival: true }).sort('-createdAt').populate('category', 'name slug');
  res.status(200).json({ success: true, count: books.length, data: books });
});

const getBestsellers = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    const bestsellers = mockBooks.filter(b => b.bestseller).slice(0, 5);
    return res.status(200).json({ success: true, count: bestsellers.length, data: bestsellers });
  }
  const books = await Book.find({ bestseller: true }).populate('category', 'name slug');
  res.status(200).json({ success: true, count: books.length, data: books });
});

const getRecommendedBooks = asyncHandler(async (req, res) => {
  // 1. Get user preferences
  const user = req.user;
  if (!user) {
    // Fallback for non-auth: return top rated
    const books = await Book.find({ rating: { $gte: 4.5 } }).limit(10).populate('category', 'name slug');
    return res.status(200).json({ success: true, count: books.length, data: books });
  }

  const { moods = [], problems = [], languages = [] } = user.preferences || {};

  // 2. Extract categories from last 10 orders
  const lastOrders = await Order.find({ user: user._id })
    .sort('-createdAt')
    .limit(10)
    .populate('orderItems.book');

  const orderedBookIds = [];
  const preferredCategories = new Set();
  
  lastOrders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.book) {
        orderedBookIds.push(item.book._id.toString());
        if (item.book.category) preferredCategories.add(item.book.category.toString());
      }
    });
  });

  // 3. Find candidates (not already ordered, matching preferences)
  // We fetch a larger pool then score manually
  const candidates = await Book.find({
    _id: { $nin: orderedBookIds },
    $or: [
      { mood: { $in: moods } },
      { problem: { $in: problems } },
      { language: { $in: languages } },
      { category: { $in: Array.from(preferredCategories) } }
    ]
  }).limit(50).populate('category', 'name slug');

  // 4. Score candidates
  const scored = candidates.map(book => {
    let score = 0;
    if (moods.includes(book.mood)) score += 3;
    if (problems.includes(book.problem)) score += 2;
    if (preferredCategories.has(book.category?._id?.toString())) score += 1;
    if (languages.includes(book.language)) score += 1;
    return { book, score };
  });

  // 5. Sort by score and return top 10
  const result = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.book);

  // Fallback if not enough recommendations
  if (result.length < 4) {
    const fallback = await Book.find({ rating: { $gte: 4.0 }, _id: { $nin: orderedBookIds } })
      .limit(10 - result.length)
      .populate('category', 'name slug');
    result.push(...fallback);
  }

  res.status(200).json({ success: true, count: result.length, data: result });
});

const searchSuggestions = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q || q.length < 2) return res.status(200).json({ success: true, data: { books: [], authors: [], categories: [] } });

  const cacheKey = `suggestions:${q}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return res.status(200).json({ success: true, data: JSON.parse(cached) });

    const [books, authors, categories] = await Promise.all([
      Book.find({ title: { $regex: q, $options: 'i' } }).select('title slug author coverImage').limit(5),
      Book.distinct('author', { author: { $regex: q, $options: 'i' } }),
      Category.find({ name: { $regex: q, $options: 'i' } }).select('name slug').limit(3)
    ]);

    const data = {
      books,
      authors: authors.slice(0, 5),
      categories
    };

    // Store in Redis (120s)
    await redis.setEx(cacheKey, 120, JSON.stringify(data));

    // Track search query (optional: for popular searches later)
    if (req.user) {
      const userSearchKey = `user:searches:${req.user._id}`;
      await redis.zAdd(userSearchKey, { score: Date.now(), value: q });
      await redis.expire(userSearchKey, 86400 * 7); // 7 days
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(200).json({ success: true, data: { books: [], authors: [], categories: [] } });
  }
});

const searchBooks = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  
  const features = new ApiFeatures(Book.find(), req.query)
    .search()
    .filter()
    .sort()
    .paginate();

  const total = await Book.countDocuments(features.filters);
  const books = await features.query.populate('category', 'name slug');

  res.status(200).json({
    success: true,
    total,
    count: books.length,
    data: books,
  });
});

const getSimilarBooks = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    return res.status(200).json({ success: true, count: 6, data: mockBooks.slice(0, 6) });
  }
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  const similar = await Book.find({ category: book.category, _id: { $ne: book._id } }).limit(6);
  res.status(200).json({ success: true, count: similar.length, data: similar });
});

const getBooksByCategory = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    const books = mockBooks.filter(b => b.category.slug === req.params.slug);
    return res.status(200).json({ success: true, count: books.length, category: req.params.slug, data: books });
  }
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  const books = await Book.find({ category: category._id }).populate('category', 'name slug');
  res.status(200).json({ success: true, count: books.length, category: category.name, data: books });
});

const getBookBySlug = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    const book = mockBooks.find(b => b.slug === req.params.slug);
    if (!book) { res.status(404); throw new Error('Book not found'); }
    return res.status(200).json({ success: true, data: { ...book, reviews: [] } });
  }
  const book = await Book.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!book) { res.status(404); throw new Error('Book not found'); }
  res.status(200).json({ success: true, data: book });
});


// @desc    Create book (admin)
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
  // Slug is generated in pre-save hook in the Model usually, but let's handle it manually if passed
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, data: book });
});

// @desc    Update book (admin)
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.status(200).json({ success: true, data: book });
});

// @desc    Delete book (admin)
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.status(200).json({ success: true, message: 'Book deleted' });
});

// @desc    Seed database
// @route   POST /api/books/seed
// @access  Public (dev only)
const seedBooks = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403);
    throw new Error('Seeding is disabled in production');
  }

  const seedData = require('../data/seedData');
  await Book.deleteMany({});
  
  // The covers are already fast URLs like 'https://covers.openlibrary.org/b/isbn/...-L.jpg'
  const books = await Book.insertMany(seedData);

  res.status(201).json({
    success: true,
    message: `Seeded ${books.length} books`,
    count: books.length,
  });
});

module.exports = {
  getBooks,
  getFeaturedBooks,
  getTrendingBooks,
  getNewArrivals,
  getBestsellers,
  getRecommendedBooks,
  searchBooks,
  getSimilarBooks,
  getBooksByCategory,
  getBookBySlug,
  searchSuggestions,
  createBook,
  updateBook,
  deleteBook,
  seedBooks
};
