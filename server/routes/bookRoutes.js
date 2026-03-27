const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET /api/books - All books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/books/search - Search books (must be before /:id)
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.json([]);
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/books/mood/:mood
router.get('/mood/:mood', async (req, res) => {
  try {
    const books = await Book.find({ moods: { $regex: new RegExp(`^${req.params.mood}$`, 'i') } });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/books/problem/:problem
router.get('/problem/:problem', async (req, res) => {
  try {
    const books = await Book.find({ problems: { $regex: new RegExp(`^${req.params.problem}$`, 'i') } });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/books/lang/:lang
router.get('/lang/:lang', async (req, res) => {
  try {
    const books = await Book.find({ language: { $regex: new RegExp(`^${req.params.lang}$`, 'i') } });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/books/:id - Single book (by _id or isbn)
router.get('/:id', async (req, res) => {
  try {
    let book;
    if (req.params.id.length === 24) {
      book = await Book.findById(req.params.id);
    } 
    if (!book) {
      book = await Book.findOne({ isbn: req.params.id });
    }
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
