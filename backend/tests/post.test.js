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

describe('Post API Security', () => {
    let user1, user2, user1Token;

    beforeEach(async () => {
        // Clear tables
        await sequelize.models.Post.destroy({ where: {} });
        await sequelize.models.User.destroy({ where: {} });

        // Create users
        user1 = await User.create({
            display_name: 'User One',
            email: 'user1@example.com',
            password: 'password123'
        });

        user2 = await User.create({
            display_name: 'User Two',
            email: 'user2@example.com',
            password: 'password123'
        });

        // Generate token for user1
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        user1Token = jwt.sign({ userId: user1.id }, JWT_SECRET, { expiresIn: '1h' });
    });

    describe('POST /api/posts', () => {
        it('should return 401 when unauthenticated', async () => {
            const response = await request(app)
                .post('/api/posts')
                .send({
                    content: 'This is a test post'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Access token required');
        });

        it('should prevent IDOR by ignoring req.body.userId', async () => {
            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    content: 'This post should belong to user1',
                    userId: user2.id // Attempting IDOR
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('userId', user1.id);
            expect(response.body.userId).not.toBe(user2.id);
        });

        it('should create a post successfully with authenticated user', async () => {
            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    content: 'Valid post'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('userId', user1.id);
            expect(response.body).toHaveProperty('content', 'Valid post');
        });
    });
});
