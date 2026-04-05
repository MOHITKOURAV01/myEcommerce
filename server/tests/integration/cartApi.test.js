const request = require('supertest');
const app = require('../../server');
const Book = require('../../models/Book');
const User = require('../../models/User');
const Coupon = require('../../models/Coupon');
const { generateAccessToken } = require('../../utils/generateToken');

describe('Cart API Integration Tests', () => {
    let user, token, book;

    beforeEach(async () => {
        user = await User.create({ name: 'Cart User', email: 'cart@test.com', password: 'password' });
        token = generateAccessToken(user._id);
        book = await Book.create({ title: 'Cart Book', author: 'Author', price: 500, stock: 10, slug: 'cart-book' });
    });

    it('GET /api/cart → empty cart for new user', async () => {
        const res = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.items.length).toBe(0);
    });

    it('POST /api/cart → adds book to cart', async () => {
        const res = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ bookId: book._id, quantity: 1 });
        
        expect(res.status).toBe(200);
        expect(res.body.data.items[0].book.title).toBe(book.title);
    });

    it('PUT /api/cart/:bookId → updates quantity', async () => {
        // Add first
        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ bookId: book._id, quantity: 1 });

        const res = await request(app)
            .put(`/api/cart/${book._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 3 });
        
        expect(res.status).toBe(200);
        expect(res.body.data.items[0].quantity).toBe(3);
    });

    it('DELETE /api/cart/:bookId → removes item', async () => {
        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ bookId: book._id, quantity: 1 });

        const res = await request(app)
            .delete(`/api/cart/${book._id}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.items.length).toBe(0);
    });

    it('POST /api/cart/apply-coupon → applies valid coupon', async () => {
        await Coupon.create({
            code: 'SAVE10',
            type: 'percent',
            value: 10,
            validTo: new Date('2030-01-01'),
            minOrderValue: 100
        });

        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ bookId: book._id, quantity: 1 });

        const res = await request(app)
            .post('/api/cart/apply-coupon')
            .set('Authorization', `Bearer ${token}`)
            .send({ code: 'SAVE10' });
        
        expect(res.status).toBe(200);
        expect(res.body.data.couponDiscount).toBe(50); // 10% of 500
    });

    it('POST /api/cart/apply-coupon → 400 on expired coupon', async () => {
        await Coupon.create({
            code: 'EXPIRED',
            type: 'percent',
            value: 10,
            validTo: new Date(Date.now() - 86400000), // Past
            minOrderValue: 100
        });

        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ bookId: book._id, quantity: 1 });

        const res = await request(app)
            .post('/api/cart/apply-coupon')
            .set('Authorization', `Bearer ${token}`)
            .send({ code: 'EXPIRED' });
        
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Coupon has expired');
    });
});
