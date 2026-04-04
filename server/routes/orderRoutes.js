const express = require('express');
const router = express.Router();
const {
  getMyOrders,
  getOrder,
  cancelOrder,
  returnOrder,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public tracking
router.get('/track/:orderNumber', trackOrder);

// Admin Routes
router.get('/admin', protect, admin, getAllOrders);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);
router.put('/admin/:id/tracking', protect, admin, updateOrderTracking);

// User Routes
router.use(protect);
router.route('/')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrder);

router.put('/:id/cancel', cancelOrder);
router.post('/:id/return', returnOrder);

module.exports = router;
