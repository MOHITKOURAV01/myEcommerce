require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

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

// Routes
app.use('/api/books', require('./routes/bookRoutes'));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
