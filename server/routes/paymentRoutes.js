const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPaymentAndCreateOrder,
  createCODOrder
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPaymentAndCreateOrder);
router.post('/cod', protect, createCODOrder);

module.exports = router;
