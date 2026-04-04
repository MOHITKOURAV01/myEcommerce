const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getWishlist);
router.post('/:bookId', toggleWishlist);
router.delete('/:bookId', removeFromWishlist);
router.post('/move-to-cart/:bookId', moveToCart);

module.exports = router;
