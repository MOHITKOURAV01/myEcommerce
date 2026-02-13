// @desc    Get all books
// @route   GET /api/books
const Book = require('../models/Book');

const getBooks = async (req, res) => {
    try {
        res.json({ message: "Books API working" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new book
// @route   POST /api/books
const createBook = async (req, res) => {
    try {
        const { title, author, language, description, buyLinks } = req.body;

        if (!title || !author) {
            return res.status(400).json({ message: "Title and Author are required" });
        }

        const book = new Book({
            title,
            author,
            language,
            description,
            buyLinks
        });

        const createdBook = await book.save();
        res.status(201).json(createdBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBooks,
    createBook,
};
