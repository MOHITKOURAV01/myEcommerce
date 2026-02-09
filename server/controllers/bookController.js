// @desc    Get all books
// @route   GET /api/books
const getBooks = async (req, res) => {
    try {
        res.json({ message: "Books API working" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBooks,
};
