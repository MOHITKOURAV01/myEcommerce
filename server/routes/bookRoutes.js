const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { getBooks, createBook, getBookById, updateBook, deleteBook, seedBooks } = require('../controllers/bookController');

// Validation Middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// @route   GET /api/books
router.get('/', getBooks);

// @route   POST /api/books
router.post(
    '/',
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('author').notEmpty().withMessage('Author is required'),
        body('language').notEmpty().withMessage('Language is required'),
        body('moods').isArray().withMessage('Moods must be an array'),
        body('problems').isArray().withMessage('Problems must be an array'),
        validateRequest
    ],
    createBook
);

// @route   POST /api/books/seed
router.post('/seed', seedBooks);

// @route   GET /api/books/:id
router.get('/:id', getBookById);

// @route   PUT /api/books/:id
router.put('/:id', updateBook);

// @route   DELETE /api/books/:id
router.delete('/:id', deleteBook);

module.exports = router;
