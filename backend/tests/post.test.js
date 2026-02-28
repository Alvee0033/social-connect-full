const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');
const authService = require('../src/services/auth.service');

beforeAll(async () => {
    await setupTestDB();
    // Clean up
    await sequelize.models.User.destroy({ where: {} });
    await sequelize.models.Post.destroy({ where: {} });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Post API', () => {
    let token;
    let userId;

    beforeAll(async () => {
        const testUser = {
            display_name: 'postuser',
            email: 'post@example.com',
            password: 'password123'
        };
        const response = await request(app).post('/api/auth/register').send(testUser);
        token = response.body.token;
        userId = response.body.id;
    });

    it('should allow authenticated user to create a post', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Hello World', imageUrl: '' });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBe(userId);
    });

    it('should ignore user-provided userId and use authenticated users ID', async () => {
        const fakeUserId = 'some-other-uuid';
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Hello IDOR', imageUrl: '', userId: fakeUserId });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBe(userId);
        expect(response.body.userId).not.toBe(fakeUserId);
    });

    it('should not allow unauthenticated user to create a post', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({ content: 'Hello IDOR', imageUrl: '' });

        expect(response.status).toBe(401);
    });
});
