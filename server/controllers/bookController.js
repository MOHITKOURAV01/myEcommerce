const Book = require('../models/Book');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const seedData = require('../data/seedData');
const mockBooks = seedData.map((b, i) => ({ ...b, _id: i.toString(), inStock: true, category: { name: b.category, slug: b.category } }));

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

const { searchOpenLibrary } = require('../utils/openLibrary');

// ... [existing imports]

// @desc    Search books (Local + Global)
// @route   GET /api/books/search
// @access  Public
const searchBooks = asyncHandler(async (req, res) => {
  const searchTerm = req.query.q || req.query.search;
  let localBooks = [];
  let globalBooks = [];
  let total = 0;

  // 1. Search Local (DB or Mocks)
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
      if (searchTerm) {
          const regex = new RegExp(searchTerm, 'i');
          localBooks = mockBooks.filter(b => regex.test(b.title) || regex.test(b.author));
      } else {
          localBooks = mockBooks.slice(0, 12);
      }
      total = localBooks.length;
  } else {
      const features = new ApiFeatures(Book.find(), req.query)
        .search()
        .filter()
        .sort()
        .paginate();
      localBooks = await features.query.populate('category', 'name slug');
      total = await Book.countDocuments(features.filters);
  }

  // 2. Search Global (Open Library) if requested
  if (searchTerm && req.query.global === 'true') {
      try {
          globalBooks = await searchOpenLibrary(searchTerm, 12);
          // Filter out duplicates if already in local
          const localIsbns = new Set(localBooks.map(b => b.isbn));
          globalBooks = globalBooks.filter(b => !localIsbns.has(b.isbn));
      } catch (e) {
          console.error('External Search Failed: 🏺', e.message);
      }
  }

  const combined = [...localBooks, ...globalBooks];

  res.status(200).json({
    success: true,
    total: total + globalBooks.length,
    count: combined.length,
    localCount: localBooks.length,
    globalCount: globalBooks.length,
    data: combined,
  });
});

const getSimilarBooks = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const similar = await Book.find({
    _id: { $ne: book._id },
    $or: [
      { category: book.category },
      { moods: { $in: book.moods } },
    ]
  })
  .sort('-rating')
  .limit(6)
  .populate('category', 'name slug');

  res.json({ success: true, data: similar });
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

const getRecommendedBooks = asyncHandler(async (req, res) => {
  if (process.env.USE_MOCK_DATA === 'true' && process.env.NODE_ENV !== 'test') {
    const recommended = mockBooks.slice(0, 8);
    return res.status(200).json({ success: true, count: recommended.length, data: recommended });
  }
  const books = await Book.find({ featured: true }).sort('-rating').limit(8).populate('category', 'name slug');
  res.status(200).json({ success: true, count: books.length, data: books });
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
const seedBooks = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && req.query.force !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Seeding is disabled in production (use ?force=true to override)'
      });
    }

    const booksToSeed = require('../data/seedData');
    await Book.deleteMany({});
    await Category.deleteMany({});

    // 1. Establish Categories
    const categoryNames = [...new Set(booksToSeed.map(b => b.category))];
    const categoryMap = {};
    for (const name of categoryNames) {
      const cat = await Category.create({ 
        name: name.charAt(0).toUpperCase() + name.slice(1),
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      });
      categoryMap[name] = cat._id;
    }

    // 2. Map & Seed Books
    const booksToInsert = booksToSeed.map(book => ({
      ...book,
      category: categoryMap[book.category]
    }));
    
    const books = await Book.insertMany(booksToInsert);

    res.status(201).json({
      success: true,
      message: `Archival Seeding SUCCESS! 🏺 ${books.length} relics cataloged.`,
      count: books.length,
    });
  } catch (error) {
    console.error('SEEDING ERROR:', error);
    next(error);
  }
};

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
  createBook,
  updateBook,
  deleteBook,
  seedBooks
};
