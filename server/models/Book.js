const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  category: { type: String },
  language: { type: String, default: 'English' },
  tags: [{ type: String }],
  moods: [{ type: String }],
  problems: [{ type: String }],
  readingTime: { type: String },
  why: { type: String },
  bestFor: { type: String },
  notFor: { type: String },
  outcome: { type: String },
  amazonLink: { type: String },
  flipkartLink: { type: String },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
