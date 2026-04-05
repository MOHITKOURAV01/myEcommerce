require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Connect to Databases
if (process.env.USE_MOCK_DATA !== 'true' && process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ─── Security Middleware ────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// ─── Stripe Webhook (raw body) ──────────────────
const { stripeWebhook } = require('./controllers/paymentController');
app.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// ─── Body Parsers (Global) ────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Rate Limiters ──────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ─── Routes ─────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'BookSmart API',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'BookSmart API is running 📚',
    version: '2.0.0',
    docs: '/health',
  });
});

// ─── Error Handling ─────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n📚 BookSmart API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health: http://localhost:${PORT}/health\n`);
  });
}

module.exports = app;
