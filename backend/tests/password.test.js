const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Password Security Tests', () => {
    it('should reject registration with a short password', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Weak User',
                email: 'weak@example.com',
                password: 'short'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/at least 8 characters/);
    });

    it('should accept registration with a strong password', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Strong User',
                email: 'strong@example.com',
                password: 'strongpassword123'
            });

        expect(response.status).toBe(201);
    });
});
