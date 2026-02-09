// @desc    Get all books
// @route   GET /api/books
const getBooks = (req, res) => {
    res.json({ message: "Books API working" });
};

module.exports = {
    getBooks,
};
