const express = require('express');
const router = express.Router();
const { getBooks, createBook } = require('../controllers/bookController');

// @route   GET /api/books
router.get('/', getBooks);

// @route   POST /api/books
router.post('/', createBook);

module.exports = router;
