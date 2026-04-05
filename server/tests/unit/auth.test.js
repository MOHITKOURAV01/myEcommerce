const { generateAccessToken, generateRefreshToken } = require('../../utils/generateToken');
const User = require('../../models/User');

describe('Auth Unit Tests', () => {
    
    it('password hashed before save (bcrypt)', async () => {
        const plainPassword = 'securePassword123!';
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: plainPassword
        });
        await user.save();
        
        // Ensure the password in DB isn't the raw string
        expect(user.password).not.toBe(plainPassword);
        
        // Ensure standard string comparison via the dedicated instance method works
        const isMatch = await user.comparePassword(plainPassword);
        expect(isMatch).toBe(true);
    });

    it('generateAccessToken returns valid JWT with userId', () => {
        const userId = '12345abcdef';
        const token = generateAccessToken(userId);
        expect(typeof token).toBe('string');
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        expect(payload.id).toBe(userId);
    });

    it('generateRefreshToken expires in 30d', () => {
        const userId = '12345abcdef';
        const token = generateRefreshToken(userId);
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Verify expiry timestamp is around 30 days from now (epoch seconds)
        const expectedExpiry = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        expect(Math.abs(payload.exp - expectedExpiry)).toBeLessThan(5); // Allowing very small delta threshold
    });

    it('tokens don\'t have password field', () => {
        const userId = '12345abcdef';
        const token = generateAccessToken(userId);
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        expect(payload.password).toBeUndefined();
    });

});
