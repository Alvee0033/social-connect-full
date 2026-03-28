const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Auth Middleware Test', () => {
    it('should correctly authenticate token', async () => {
        // register user
        const testUser = {
            display_name: 'testuser',
            email: 'testauth@example.com',
            password: 'password123'
        };
        const res = await request(app).post('/api/auth/register').send(testUser);
        const token = res.body.token;

        // hit a protected endpoint
        const res2 = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'hello' });

        console.log(res2.body);
        expect(res2.status).toBe(201);
    });
});
