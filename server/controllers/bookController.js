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
        const { title, author, language, description, buyLinks, moods, problems } = req.body;

        if (!title || !author || !language) {
            return res.status(400).json({ message: "Title, Author, and Language are required" });
        }

        const book = new Book({
            title,
            author,
            language,
            description,
            buyLinks,
            moods,
            problems
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
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Request body cannot be empty" });
        }

        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed sample books
// @route   POST /api/books/seed
const seedBooks = async (req, res) => {
    try {
        await Book.deleteMany(); // Clear existing data to avoid duplicates

        const books = [
            {
                title: "Rich Dad Poor Dad",
                author: "Robert Kiyosaki",
                language: "English",
                description: "What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!",
                moods: ["Motivation", "Finance"],
                problems: ["Money", "Poverty"],
                buyLinks: { amazon: "https://amazon.com", flipkart: "https://flipkart.com" }
            },
            {
                title: "Wings of Fire",
                author: "A.P.J. Abdul Kalam",
                language: "English",
                description: "An Autobiography of A.P.J. Abdul Kalam",
                moods: ["Inspiration", "Biography"],
                problems: ["Struggle", "Career"],
                buyLinks: { amazon: "https://amazon.com", flipkart: "https://flipkart.com" }
            },
            {
                title: "Atomic Habits",
                author: "James Clear",
                language: "English",
                description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
                moods: ["Productivity", "Self-help"],
                problems: ["Procrastination", "Bad Habits"],
                buyLinks: { amazon: "https://amazon.com", flipkart: "https://flipkart.com" }
            },
            {
                title: "Ikigai",
                author: "Hector Garcia",
                language: "English",
                description: "The Japanese Secret to a Long and Happy Life",
                moods: ["Happiness", "Philosophy"],
                problems: ["Stress", "Purpose"],
                buyLinks: { amazon: "https://amazon.com", flipkart: "https://flipkart.com" }
            },
            {
                title: "Bhagavad Gita",
                author: "Vyasa",
                language: "English",
                description: "The Song of God",
                moods: ["Spirituality", "Peace"],
                problems: ["Confusion", "Sorrow"],
                buyLinks: { amazon: "https://amazon.com", flipkart: "https://flipkart.com" }
            }
        ];

        await Book.insertMany(books);
        res.status(201).json({ message: "Sample books added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBooks,
    createBook,
    getBookById,
    updateBook,
    deleteBook,
    seedBooks,
};
