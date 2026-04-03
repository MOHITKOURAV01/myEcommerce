const express = require('express');
const router = express.Router();
const {
  getOverview,
  getRevenueAnalytics,
  getTopBooks
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are admin only
router.use(protect);
router.use(admin);

router.get('/analytics/overview', getOverview);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/top-books', getTopBooks);

module.exports = router;
