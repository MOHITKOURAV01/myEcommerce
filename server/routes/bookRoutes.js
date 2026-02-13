const express = require('express');
const router = express.Router();
const { getBooks, createBook, getBookById, updateBook, deleteBook } = require('../controllers/bookController');

// @route   GET /api/books
router.get('/', getBooks);

// @route   POST /api/books
router.post('/', createBook);

// @route   GET /api/books/:id
router.get('/:id', getBookById);

// @route   PUT /api/books/:id
router.put('/:id', updateBook);

// @route   DELETE /api/books/:id
router.delete('/:id', deleteBook);

module.exports = router;
