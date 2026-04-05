const request = require('supertest');
const app = require('../../server');
const Book = require('../../models/Book');
const User = require('../../models/User');
const Cart = require('../../models/Cart');
const Order = require('../../models/Order');
const { generateAccessToken } = require('../../utils/generateToken');

describe('Order API Integration Tests', () => {
    let user, token, book;

    beforeEach(async () => {
        user = await User.create({
            name: 'Order User',
            email: 'order-api@test.com',
            password: 'password',
            addresses: [{
                fullName: 'John Doe',
                phone: '9876543210',
                line1: '123 Street',
                city: 'City',
                state: 'State',
                pincode: '123456'
            }]
        });
        token = generateAccessToken(user._id);
        book = await Book.create({ title: 'Order Book', author: 'Author', price: 100, stock: 10, slug: 'order-book' });
        
        // Add to cart first
        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ bookId: book._id, quantity: 1 });
    });

    it('POST /api/payment/cod → creates order, clears cart', async () => {
        const res = await request(app)
            .post('/api/payment/cod')
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                addressId: user.addresses[0]._id 
            });
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.orderNumber).toBeDefined();

        // Check cart is empty
        const cartRes = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${token}`);
        expect(cartRes.body.data.items.length).toBe(0);
    });

    it('GET /api/orders → returns only user\'s orders', async () => {
        // Create an order first
        await request(app)
            .post('/api/payment/cod')
            .set('Authorization', `Bearer ${token}`)
            .send({ addressId: user.addresses[0]._id });

        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
    });

    it('GET /api/orders/:id → returns order detail', async () => {
        const orderRes = await request(app)
            .post('/api/payment/cod')
            .set('Authorization', `Bearer ${token}`)
            .send({ addressId: user.addresses[0]._id });

        const orderId = orderRes.body.data._id;

        const res = await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(orderId);
    });

    it('PUT /api/orders/:id/cancel → cancels placed order', async () => {
        const orderRes = await request(app)
            .post('/api/payment/cod')
            .set('Authorization', `Bearer ${token}`)
            .send({ addressId: user.addresses[0]._id });

        const orderId = orderRes.body.data._id;

        const res = await request(app)
            .put(`/api/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${token}`)
            .send({ reason: 'Changed my mind' });
        
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('cancelled');
    });

    it('PUT /api/orders/:id/cancel → 400 on delivered order', async () => {
        const orderRes = await request(app)
            .post('/api/payment/cod')
            .set('Authorization', `Bearer ${token}`)
            .send({ addressId: user.addresses[0]._id });

        const orderId = orderRes.body.data._id;
        
        // Manually mark as delivered in DB
        const order = await Order.findById(orderId);
        order.status = 'delivered';
        await order.save();

        const res = await request(app)
            .put(`/api/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${token}`)
            .send({ reason: 'Too late' });
        
        expect(res.status).toBe(400);
    });
});
