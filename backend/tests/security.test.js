// Set env vars before requiring app
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

const { setupTestDB, sequelize } = require('./testSetup');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Fix Verification', () => {

    let userId;
    let token;

    beforeEach(async () => {
        // Create a user
        const user = await User.create({
            display_name: 'Valid User',
            email: 'valid@example.com',
            password: 'password123'
        });
        userId = user.id;

        // Generate a valid token
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
    });

    afterEach(async () => {
        // Clean up
        await User.destroy({ where: {} });
    });

    it('should BLOCK unauthenticated post creation (Fix Verified)', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'This post should be blocked',
                userId: userId // Trying to spoof, but should be ignored/blocked
            });

        expect(response.status).toBe(401);
    });

    it('should BLOCK unauthenticated reaction (Fix Verified)', async () => {
        // Need to manually create a post first since the API now requires auth
        const post = await sequelize.models.Post.create({
            content: 'Post to react to',
            userId: userId
        });

        const response = await request(app)
            .post(`/api/posts/${post.id}/react`); // No token

        expect(response.status).toBe(401);
    });

    it('should ALLOW authenticated post creation', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'This is a valid post'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.User.displayName).toBe('Valid User');
        expect(response.body.userId).toBe(userId);
    });
});
