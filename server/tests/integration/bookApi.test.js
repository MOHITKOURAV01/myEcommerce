const request = require('supertest');
const app = require('../../server');
const Book = require('../../models/Book');
const User = require('../../models/User');
const { generateAccessToken } = require('../../utils/generateToken');

describe('Book API Integration Tests', () => {

    beforeEach(async () => {
        await Book.create([
            { title: 'Atomic Habits', author: 'James Clear', price: 300, stock: 10, moods: ['Motivated'], slug: 'atomic-habits' },
            { title: 'Deep Work', author: 'Cal Newport', price: 400, stock: 5, moods: ['Focused'], slug: 'deep-work' },
            { title: 'The Alchemist', author: 'Paulo Coelho', price: 200, stock: 0, moods: ['Inspirational'], slug: 'the-alchemist' }
        ]);
    });

    it('GET /api/books → 200 + paginated array', async () => {
        const res = await request(app).get('/api/books');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.total).toBe(3);
    });

    it('GET /api/books?q=atomic → returns matching books', async () => {
        const res = await request(app).get('/api/books?q=atomic');
        expect(res.status).toBe(200);
        expect(res.body.data[0].title).toBe('Atomic Habits');
    });

    it('GET /api/books?mood=Motivated → filtered correctly', async () => {
        const res = await request(app).get('/api/books?mood=Motivated');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].title).toBe('Atomic Habits');
    });

    it('GET /api/books?price[lte]=300 → price filter works', async () => {
        const res = await request(app).get('/api/books?price[lte]=300');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
    });

    it('GET /api/books/:slug → 200 single book', async () => {
        const res = await request(app).get('/api/books/atomic-habits');
        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Atomic Habits');
    });

    it('GET /api/books/:slug → 404 for unknown slug', async () => {
        const res = await request(app).get('/api/books/unknown-book');
        expect(res.status).toBe(404);
    });

    it('POST /api/books → 403 for non-admin user', async () => {
        const user = await User.create({ name: 'User', email: 'user@test.com', password: 'password', role: 'user' });
        const token = generateAccessToken(user._id);

        const res = await request(app)
            .post('/api/books')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New Book', author: 'Author', price: 100, stock: 10 });
        
        expect(res.status).toBe(403);
    });

    it('POST /api/books → 201 for admin user', async () => {
        const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
        const token = generateAccessToken(admin._id);

        const res = await request(app)
            .post('/api/books')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Admin Book', author: 'Admin', price: 100, stock: 10 });
        
        expect(res.status).toBe(201);
    });
});
