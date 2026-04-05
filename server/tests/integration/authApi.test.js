const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('Auth API Integration Tests', () => {
    const testUser = {
        name: 'Integration User',
        email: 'int@example.com',
        password: 'Password123!'
    };

    it('POST /api/auth/register → 201 + user object', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.accessToken).toBeDefined();
    });

    it('POST /api/auth/register → 400 on duplicate email', async () => {
        await User.create(testUser);
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.status).toBe(400);
    });

    it('POST /api/auth/login → 200 + token on valid creds', async () => {
        await User.create(testUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });
        
        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeDefined();
    });

    it('POST /api/auth/login → 401 on wrong password', async () => {
        await User.create(testUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });
        
        expect(res.status).toBe(401);
    });

    it('GET /api/auth/me → 200 with valid token', async () => {
        await User.create(testUser);
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });
        
        const token = loginRes.body.accessToken;

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(testUser.email);
    });

    it('GET /api/auth/me → 401 without token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});
