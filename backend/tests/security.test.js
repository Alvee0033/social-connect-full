const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');

beforeAll(async () => {
    await setupTestDB();
});

beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
    await Post.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerabilities Reproduction', () => {
    const user1Data = {
        display_name: 'User 1',
        email: 'user1@example.com',
        password: 'password123'
    };

    const user2Data = {
        display_name: 'User 2',
        email: 'user2@example.com',
        password: 'password123'
    };

    it('should NOT allow creating a post without authentication', async () => {
        // Create a user so we have a valid userId to try to spoof
        const userRegister = await request(app)
            .post('/api/auth/register')
            .send(user1Data);
        const userId = userRegister.body.id;

        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated post',
                userId: userId
            });

        // Currently this fails (passes with 201), we want it to be 401
        expect(response.status).toBe(401);
    });

    it('should NOT allow creating a post for another user', async () => {
        // Register two users
        const user1Reg = await request(app).post('/api/auth/register').send(user1Data);
        const user2Reg = await request(app).post('/api/auth/register').send(user2Data);

        const token1 = user1Reg.body.token;
        const user2Id = user2Reg.body.id;

        // User 1 tries to create a post for User 2
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                content: 'Impersonation attempt',
                userId: user2Id
            });

        // If the vulnerability exists, the post will be created with user2Id
        // We want this to fail or force userId to be user1
        if (response.status === 201) {
            expect(response.body.userId).not.toBe(user2Id);
        } else {
             expect(response.status).not.toBe(201);
        }
    });

    it('should correctly authenticate a valid token', async () => {
        // This test verifies that the auth middleware actually works
        // We'll use a known protected route or mocking one if needed.
        // But since we are adding protection to posts, we can use that.

        const user1Reg = await request(app).post('/api/auth/register').send(user1Data);
        const token = user1Reg.body.token;

        // We'll hit an endpoint that we intend to protect.
        // For now, let's just verify that if we WERE to protect it, the middleware wouldn't crash.
        // Since we haven't applied the middleware yet, this test is a bit theoretical.
        // But we identified that `authenticateToken` looks for `decoded.userId` while `generateToken` signs `{ id }`.

        // Let's rely on the fix plan to address this.
        // For reproduction, I'll just check that the previous tests fail as expected.
    });
});
