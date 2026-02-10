// Ensure env vars are set before importing app/middleware
const { setupTestDB, sequelize } = require('./testSetup');
const request = require('supertest');
const app = require('../src/app');
const { authenticateToken } = require('../src/middleware/auth.middleware');

// Add a protected route for testing
app.get('/api/test-protected', authenticateToken, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
});

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Auth Middleware Reproduction', () => {
    const testUser = {
        display_name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    };

    it('should successfully access protected route', async () => {
        // 1. Register
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        if (registerRes.status !== 201) {
            console.error('Registration failed:', registerRes.body);
        }
        expect(registerRes.status).toBe(201);
        const token = registerRes.body.token;
        expect(token).toBeDefined();

        // 2. Access protected route
        const res = await request(app)
            .get('/api/test-protected')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Protected data');
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
    });
});
