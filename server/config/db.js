const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string') {
            console.warn('⚠️  MongoDB URI not configured. Please set MONGO_URI in .env file');
            console.warn('⚠️  Server will start but database operations will fail');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('⚠️  Server will continue without database connection');
        console.warn('⚠️  Please check your MONGO_URI and ensure MongoDB is accessible');
    }
};

module.exports = connectDB;
