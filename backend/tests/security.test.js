const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerabilities', () => {
    let user1;
    let user2;
    let token1;

    beforeEach(async () => {
        // Clean DB
        await Post.destroy({ where: {}, truncate: true });
        await User.destroy({ where: {}, truncate: true });

        // Create users via API to get tokens
        const res1 = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'User One',
                email: 'user1@example.com',
                password: 'password123'
            });
        user1 = res1.body;
        token1 = user1.token;

        const res2 = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'User Two',
                email: 'user2@example.com',
                password: 'password123'
            });
        user2 = res2.body;
    });

    it('should prevent unauthenticated post creation', async () => {
        const res = await request(app)
            .post('/api/posts')
            .send({
                content: 'I am a hacker',
                userId: user1.id
            });

        // Currently fails (vulnerable)
        expect(res.status).toBe(401);
    });

    it('should prevent IDOR: User cannot post as another user', async () => {
        // User 1 tries to post as User 2
        // Even with a valid token for User 1, they shouldn't be able to assign userId = user2.id
        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                content: 'I am impersonating User Two',
                userId: user2.id
            });

        // The system should either:
        // 1. Ignore userId in body and use token's userId (so post is owned by user1)
        // 2. Reject the request if userId in body doesn't match token

        if (res.status === 201) {
             // If created, MUST be owned by user1
             expect(res.body.userId).toBe(user1.id);
             expect(res.body.userId).not.toBe(user2.id);
        } else {
             // Or rejected
             expect(res.status).not.toBe(201);
        }
    });
});
