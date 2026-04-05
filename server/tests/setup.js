const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config();

// Ensure test JWT secrets are set if not in .env
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'testrefreshsecret';

const mongoServerRef = { current: null };

// Increase timeout for long running setup
jest.setTimeout(60000);

beforeAll(async () => {
    // Prevent Mongoose from crashing if connection drops momentarily in tests
    mongoose.set('strictQuery', false);

    mongoServerRef.current = await MongoMemoryServer.create();
    const uri = mongoServerRef.current.getUri();
    process.env.MONGO_URI = uri;
    
    // Disconnect any existing mongoose connection before attempting to connect to the memory server
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    await mongoose.connect(uri);

    // Initialize models to ensure indexes (like text search) are created in the memory server
    const Book = require('../models/Book');
    const User = require('../models/User');
    const Coupon = require('../models/Coupon');
    const Order = require('../models/Order');

    await Promise.all([
        Book.init(),
        User.init(),
        Coupon.init(),
        Order.init()
    ]);
}, 30000); // 30s timeout for beforeAll

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServerRef.current) {
        await mongoServerRef.current.stop();
    }
}, 30000);

afterEach(async () => {
    // Clear out databases between individual integration tests to prevent state leakage
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});
