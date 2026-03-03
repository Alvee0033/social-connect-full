const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Post API Security and IDOR Protection', () => {
    let user1Token;
    let user1Id;
    let user2Id;

    beforeAll(async () => {
        // Create user 1
        const res1 = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'user1',
                email: 'user1@example.com',
                password: 'password123'
            });

        user1Token = res1.body.token;
        user1Id = res1.body.id;

        // Create user 2
        const res2 = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'user2',
                email: 'user2@example.com',
                password: 'password123'
            });

        user2Id = res2.body.id;
    });

    it('should prevent unauthenticated users from creating posts', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({ content: 'Test post' });

        expect(response.status).toBe(401);
    });

    it('should use authenticated user ID regardless of provided userId in body (IDOR fix)', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                content: 'Test post from user1 trying to be user2',
                userId: user2Id // Trying to act as user 2
            });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBe(user1Id); // Should be created as user 1
        expect(response.body.userId).not.toBe(user2Id);
    });
});
