const express = require('express');
const router = express.Router();
const {
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
  getBookBySlug,
  searchSuggestions,
  createBook,
  updateBook,
  deleteBook,
  seedBooks
} = require('../controllers/bookController');
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');
const { cache, invalidateCache } = require('../middleware/cacheMiddleware');

// Seed (dev only)
router.post('/seed', seedBooks);

// Custom curated endpoints
router.get('/featured', cache(600), getFeaturedBooks);
router.get('/trending', cache(600), getTrendingBooks);
router.get('/new-arrivals', cache(300), getNewArrivals);
router.get('/bestsellers', cache(300), getBestsellers);

// Search
router.get('/search', cache(120), searchBooks);
router.get('/suggestions', optionalProtect, searchSuggestions);

// Personalized
router.get('/recommended', protect, getRecommendedBooks);

// Category and similar matching
router.get('/similar/:id', getSimilarBooks);
router.get('/category/:slug', getBooksByCategory);

// General endpoints
router.get('/', cache(300), getBooks);
router.get('/:slug', cache(600), getBookBySlug);

// Admin endpoints
router.post('/', protect, admin, async (req, res, next) => {
    await invalidateCache('cache:/api/books*');
    createBook(req, res, next);
});
router.put('/:id', protect, admin, async (req, res, next) => {
    await invalidateCache('cache:/api/books*');
    updateBook(req, res, next);
});
router.delete('/:id', protect, admin, async (req, res, next) => {
    await invalidateCache('cache:/api/books*');
    deleteBook(req, res, next);
});

module.exports = router;
