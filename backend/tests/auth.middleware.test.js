const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');
const User = require('../src/models/user.model');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Authentication functionality', () => {
    it('should access protected route with valid token', async () => {
        // Register a user
        const res = await request(app).post('/api/auth/register').send({
            display_name: 'authtest',
            email: 'auth@example.com',
            password: 'password123'
        });
        const token = res.body.token;

        // Try to create a post which requires auth
        const postRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Hello World' });

        expect(postRes.status).toBe(201);
    });
});
