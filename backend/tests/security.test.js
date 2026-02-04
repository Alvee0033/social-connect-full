process.env.JWT_SECRET = 'test-secret'; // Ensure secret is set before app/middleware loads

const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

beforeEach(async () => {
    // Clean up DB before each test
    await User.destroy({ where: {} });
    await Post.destroy({ where: {} });
});

describe('Security: Post Creation', () => {
    let user1;
    let user2;
    let token1;

    beforeEach(async () => {
        // Create two users
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
        // Matches auth.service.js: jwt.sign({ id }, secret)
        token1 = jwt.sign({ id: user1.id }, process.env.JWT_SECRET);
    });

    it('should NOT allow creating a post without a token', async () => {
        const res = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated post',
                userId: user1.id
            });

        expect(res.status).toBe(401);
    });

    it('should ignore spoofed userId in body and assign post to authenticated user', async () => {
        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                content: 'Spoofed post',
                userId: user2.id // Attacker trying to post as user2
            });

        expect(res.status).toBe(201);

        const post = await Post.findOne({ where: { content: 'Spoofed post' } });
        expect(post).not.toBeNull();
        expect(post.userId).toBe(user1.id); // Should be the token owner
        expect(post.userId).not.toBe(user2.id); // Should NOT be the target
    });
});
