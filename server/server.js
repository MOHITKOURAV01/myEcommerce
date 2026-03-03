require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Security & CORS Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(mongoSanitize());

// Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Middleware
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('BookSmart API is running');
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: "OK", service: "BookSmart API" });
});

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Apply rate limiting to all /api/ routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/books', require('./routes/bookRoutes'));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
