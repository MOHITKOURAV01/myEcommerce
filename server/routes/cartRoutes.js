const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartCount
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.get('/count', getCartCount);

router.route('/:bookId')
  .put(updateCartItem)
  .delete(removeFromCart);

router.post('/apply-coupon', applyCoupon);
router.delete('/remove-coupon', removeCoupon);

module.exports = router;
