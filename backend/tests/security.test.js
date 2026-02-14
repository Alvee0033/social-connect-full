const { setupTestDB, sequelize } = require('./testSetup'); // Must be imported before app to set env vars
const request = require('supertest');
const jwt = require('jsonwebtoken'); // Need this to generate tokens
const app = require('../src/app');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');

// Make sure JWT_SECRET matches what's used in auth middleware
// In testSetup.js we set it to 'test-secret' if not present
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerabilities', () => {
    let userId;
    let token;

    beforeEach(async () => {
        // Clean up database before each test
        await User.destroy({ where: {}, truncate: true });
        await Post.destroy({ where: {}, truncate: true });

        // Create a user directly in the database
        const user = await User.create({
            display_name: 'Security Tester',
            email: 'security@example.com',
            password: 'password123'
        });
        userId = user.id;

        // Generate a valid token for this user
        // Note: auth.service.js uses { id: user.id }
        token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    });

    it('should REJECT unauthenticated post creation', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'This is an unauthorized post',
                userId: userId // Even with ID, it should fail without token
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Access token required');
    });

    it('should REJECT post creation with invalid token', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', 'Bearer invalid-token')
            .send({
                content: 'This is an unauthorized post',
            });

        // Middleware returns 401 for invalid token
        expect(response.status).toBe(401);
    });

    it('should ALLOW authenticated post creation and ignore body userId', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'This is a secure post',
                userId: 'some-other-uuid' // Attempt IDOR - should be ignored
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('content', 'This is a secure post');
        expect(response.body.User.id).toBe(userId); // Should match the token user, not the body user
    });
});
