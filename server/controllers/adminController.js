const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard overview analytics
// @route   GET /api/admin/analytics/overview
// @access  Private/Admin
const getOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [revenueData, ordersToday, activeUsers, lowStockBooks] = await Promise.all([
    // Total Revenue (Paid orders)
    Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    // Orders Today
    Order.countDocuments({ createdAt: { $gte: today } }),
    // Active Users (last 30d)
    User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } }),
    // Low Stock Items
    Book.find({ stock: { $lt: 10 } }).select('title stock price').limit(10)
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: revenueData[0]?.total || 0,
      ordersToday,
      activeUsers,
      lowStockCount: lowStockBooks.length,
      lowStockBooks
    }
  });
});

// @desc    Get revenue chart data
// @route   GET /api/admin/analytics/revenue
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
  let days = 7;
  let groupFormat = '%Y-%m-%d';

  if (period === 'month') days = 30;
  else if (period === 'year') { days = 365; groupFormat = '%Y-%m'; }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const revenue = await Order.aggregate([
    { 
      $match: { 
        'paymentInfo.status': 'paid',
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({ success: true, count: revenue.length, data: revenue });
});

// @desc    Get top selling books
// @route   GET /api/admin/analytics/top-books
const getTopBooks = asyncHandler(async (req, res) => {
  const topBooks = await Order.aggregate([
    { $match: { 'paymentInfo.status': 'paid' } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.book',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    { $unwind: '$bookDetails' }
  ]);

  res.status(200).json({ success: true, count: topBooks.length, data: topBooks });
});

module.exports = {
  getOverview,
  getRevenueAnalytics,
  getTopBooks
};
