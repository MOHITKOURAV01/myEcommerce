const express = require('express');
const router = express.Router();
const { getBooks, createBook, getBookById } = require('../controllers/bookController');

// @route   GET /api/books
router.get('/', getBooks);

// @route   POST /api/books
router.post('/', createBook);

// @route   GET /api/books/:id
router.get('/:id', getBookById);

module.exports = router;
