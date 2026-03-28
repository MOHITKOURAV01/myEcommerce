const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');
const seedData = require('./seedData');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/booksmart');
    console.log('MongoDB connected for seeding...');
    await Book.deleteMany();
    await Book.insertMany(seedData);
    console.log(`Database seeded successfully with ${seedData.length} books!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
