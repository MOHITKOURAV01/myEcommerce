const express = require('express');
const router = express.Router();

// @route   GET /api/books
// @desc    Test route
router.get('/', (req, res) => {
    res.json({ message: "Books API working" });
});

module.exports = router;
