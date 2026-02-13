// @desc    Get all books
// @route   GET /api/books
const Book = require('../models/Book');

const getBooks = async (req, res) => {
    try {
        const { language, mood, problem } = req.query;
        let query = {};

        if (language) {
            query.language = language;
        }
        if (mood) {
            query.moods = mood;
        }
        if (problem) {
            query.problems = problem;
        }

        const books = await Book.find(query);
        res.json(books);
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

// @desc    Get single book
// @route   GET /api/books/:id
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: "Invalid Book ID" });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: "Invalid Book ID" });
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json({ message: "Book removed" });
    } catch (error) {
        res.status(500).json({ message: "Invalid Book ID" });
    }
};

module.exports = {
    getBooks,
    createBook,
    getBookById,
    updateBook,
    deleteBook,
};
