const request = require('supertest');
const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is set BEFORE requiring app, so middleware picks it up
process.env.JWT_SECRET = 'test-secret';

const app = require('../src/app');
const User = require('../src/models/user.model');
const { setupTestDB, sequelize } = require('./testSetup');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Reproduction', () => {
    let testUser;
    const fallbackSecret = 'your-super-secret-jwt-key-change-in-production';
    const legitimateSecret = 'test-secret';

    beforeEach(async () => {
        await User.destroy({ where: {} });
        testUser = await User.create({
            display_name: 'Security Test User',
            email: 'sectest@example.com',
            password: 'password123'
        });
    });

    it('Exploit: Should FAIL to access protected route using fallback secret', async () => {
        // Vulnerability: Fallback secret was used. Now it should be rejected.
        // We sign with the OLD fallback secret
        const token = jwt.sign({ userId: testUser.id }, fallbackSecret, { expiresIn: '1h' });

        const response = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${token}`);

        // Should fail because server uses process.env.JWT_SECRET ('test-secret')
        // and signature verification will fail.
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid token');
    });

    it('Legitimate: Should access protected route using legitimate secret and correct payload', async () => {
        // Fix: Middleware should now look for 'id', and verification works with env var.
        const token = jwt.sign({ id: testUser.id }, legitimateSecret, { expiresIn: '1h' });

        const response = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${token}`);

        // Should succeed
        expect(response.status).toBe(200);
    });
});
