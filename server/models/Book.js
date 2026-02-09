const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    problems: [String],
    moods: [String],
    description: String,
    buyLinks: {
        amazon: String,
        flipkart: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', bookSchema);
