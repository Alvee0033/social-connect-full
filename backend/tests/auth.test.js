const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Authenticated endpoint', () => {
    it('should authenticate user', async () => {
        const testUser = {
            display_name: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        const regRes = await request(app).post('/api/auth/register').send(testUser);
        const token = regRes.body.token;

        const postRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Hello' });

        expect(postRes.status).toBe(201);
        expect(postRes.body).toHaveProperty('content', 'Hello');
    });
});
