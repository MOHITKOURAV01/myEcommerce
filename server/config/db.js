const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test' && !process.env.MONGO_URI) {
    return; // Tests will connect via setup.js
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
