const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Fix Verification', () => {
    test('Protected route should be accessible with valid token', async () => {
        const testUser = {
            display_name: 'Security Test User',
            email: 'security_fix@example.com',
            password: 'password123'
        };

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        if (registerRes.status !== 201) {
            console.error('Registration failed:', registerRes.body);
        }
        expect(registerRes.status).toBe(201);
        const token = registerRes.body.token;

        const protectedRes = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${token}`);

        if (protectedRes.status !== 200) {
            console.log('Protected route failed:', protectedRes.status, protectedRes.body);
        }
        // Should succeed now (200 OK)
        expect(protectedRes.status).toBe(200);
    });
});
