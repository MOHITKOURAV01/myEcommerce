const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/Book');
const Category = require('../models/Category');
const seedData = require('../data/seedData');

const seedDB = async () => {
    try {
        console.log('Connecting to Ancient Archives (MongoDB)...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connection Established. 🏺');

        // Clear existing relics
        console.log('Clearing old archives...');
        await Book.deleteMany({});
        await Category.deleteMany({});

        // 1. Extract unique categories from seedData
        const categoryNames = [...new Set(seedData.map(b => b.category))];
        console.log(`Found ${categoryNames.length} categories to establish.`);

        // 2. Map category names to IDs
        const categoryMap = {};
        for (const name of categoryNames) {
            const cat = await Category.create({ 
                name: name.charAt(0).toUpperCase() + name.slice(1), 
                slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
            });
            categoryMap[name] = cat._id;
        }

        // 3. Prepare books with proper Category ObjectIds
        const booksToInsert = seedData.map(book => ({
            ...book,
            category: categoryMap[book.category]
        }));

        console.log(`Injecting ${booksToInsert.length} Archival Books...`);
        const createdBooks = await Book.insertMany(booksToInsert);
        console.log(`SUCCESS! 🏺 ${createdBooks.length} books have been archived.`);

        process.exit(0);
    } catch (error) {
        console.error('ERROR SEEDING ARCHIVES: 🛡️', error.message);
        process.exit(1);
    }
};

seedDB();
