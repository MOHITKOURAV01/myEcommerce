const express = require('express');
const router = express.Router();
const {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/book/:bookId', getBookReviews);

router.post('/', protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.post('/:id/helpful', protect, toggleHelpful);

module.exports = router;
