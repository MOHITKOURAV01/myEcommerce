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
    createBook,
    updateBook,
    deleteBook,
    seedBooks
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

// Seed (dev only)
router.post('/seed', seedBooks);

// Custom curated endpoints
router.get('/featured', getFeaturedBooks);
router.get('/trending', getTrendingBooks);
router.get('/new-arrivals', getNewArrivals);
router.get('/bestsellers', getBestsellers);

// Search
router.get('/search', searchBooks);

// Personalized
router.get('/recommended', protect, getRecommendedBooks);

// Category and similar matching
router.get('/similar/:id', getSimilarBooks);
router.get('/category/:slug', getBooksByCategory);

// General endpoints
router.get('/', getBooks);
router.get('/:slug', getBookBySlug);

// Admin endpoints
router.post('/', protect, admin, createBook);
router.put('/:id', protect, admin, updateBook);
router.delete('/:id', protect, admin, deleteBook);

module.exports = router;
