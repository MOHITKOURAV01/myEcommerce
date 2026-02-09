const express = require('express');
const router = express.Router();
const { getBooks } = require('../controllers/bookController');

// @route   GET /api/books
router.get('/', getBooks);

module.exports = router;
