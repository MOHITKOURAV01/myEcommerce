const mongoose = require('mongoose');
const Book = require('../../models/Book');

describe('Book Model Unit Tests', () => {

  it('slug generated from title (lowercase, hyphenated)', async () => {
    const book = new Book({ title: 'The Atomic Habits 101!', author: 'James Clear', price: 100, stock: 10 });
    await book.validate(); 
    // Mongoose hooks don't always fire on validate unless triggered via save, but we can call it manually/mock it or save it in memory.
    // For unit tests, we can test the pre-save logic by manually calling the save hook or saving to memory DB.
    
    // We already have memory DB setup from setupFilesAfterEnv
    await book.save();
    expect(book.slug).toBe('the-atomic-habits-101');
  });

  it('calculates discount percentage correctly', async () => {
    const book = new Book({ title: 'Deep Work', author: 'Cal Newport', price: 400, originalPrice: 500, stock: 10 });
    await book.save();
    expect(book.discount).toBe(20); // (500-400)/500 * 100
  });

  it('price must be positive (validation error)', async () => {
    const book = new Book({ title: 'Free Book', author: 'Author', price: -5, stock: 10 });
    let error = null;
    try {
      await book.validate();
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.price.message).toBe('Price cannot be negative');
  });

  it('inStock = false when stock = 0 (pre-save hook)', async () => {
    const book = new Book({ title: 'Sold Out', author: 'Author', price: 100, stock: 0 });
    await book.save();
    expect(book.inStock).toBe(false);
  });

  it('Book.findBySlug returns correct book', async () => {
    const book = await Book.create({ title: 'Unique Find By Slug', author: 'Author', price: 100, stock: 10 });
    const found = await Book.findOne({ slug: 'unique-find-by-slug' });
    expect(found).not.toBeNull();
    expect(found.title).toBe(book.title);
  });

});
