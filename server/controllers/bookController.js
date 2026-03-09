const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all books
// @route   GET /api/books
const getBooks = asyncHandler(async (req, res) => {
    const { language, mood, problem, readingLevel } = req.query;
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
    if (readingLevel) {
        query.readingLevel = readingLevel;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query).skip(skip).limit(limit);

    res.json({
        success: true,
        count: books.length,
        page,
        totalPages: Math.ceil(total / limit),
        data: books
    });
});

// @desc    Add a new book
// @route   POST /api/books
const createBook = asyncHandler(async (req, res) => {
    const { title, author, language, description, buyLinks, moods, problems, readingLevel } = req.body;

    if (!title || !author || !language) {
        res.status(400);
        throw new Error("Title, Author, and Language are required");
    }

    const book = new Book({
        title,
        author,
        language,
        description,
        buyLinks,
        moods,
        problems,
        readingLevel
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
});

// @desc    Get single book
// @route   GET /api/books/:id
const getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
        res.status(404);
        throw new Error("Book not found");
    }

    res.json(book);
});

// @desc    Update book
// @route   PUT /api/books/:id
const updateBook = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(400);
        throw new Error("Request body cannot be empty");
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!book) {
        res.status(404);
        throw new Error("Book not found");
    }

    res.json(book);
});

// @desc    Delete book
// @route   DELETE /api/books/:id
const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
        res.status(404);
        throw new Error("Book not found");
    }

    res.json({ message: "Book removed" });
});

// @desc    Seed sample books
// @route   POST /api/books/seed
const seedBooks = asyncHandler(async (req, res) => {
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
});

module.exports = {
    getBooks,
    createBook,
    getBookById,
    updateBook,
    deleteBook,
    seedBooks,
};
