const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');

beforeEach(async () => {
    await setupTestDB();
    await User.destroy({ where: {}, truncate: true });
    await Post.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Tests', () => {

    describe('IDOR in Post Creation', () => {
        let userA, userB, tokenA;

        beforeEach(async () => {
            // Create two users
            userA = await User.create({
                display_name: 'User A',
                email: 'usera@example.com',
                password: 'password123'
            });

            userB = await User.create({
                display_name: 'User B',
                email: 'userb@example.com',
                password: 'password456'
            });

            // Login as User A to get token
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'usera@example.com',
                    password: 'password123'
                });
            tokenA = loginRes.body.token;
        });

        it('should NOT allow User A to create a post for User B', async () => {
            // Attempt to create a post with User B's ID in the body
            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    content: 'This is a spoofed post',
                    userId: userB.id
                });

            // Verify the post was NOT created for User B
            // If the vulnerability exists, the post might be created for User B or User A depending on implementation
            // The goal is to ensure it is attributed to User A (ignoring the body) or rejected if we enforce body matching

            // Current vulnerable behavior (likely):
            // 1. If logic trusts body.userId, post is created for User B.
            // 2. If logic ignores body.userId and uses token, post is created for User A.

            // We want to asserting that the system is SECURE.
            // So we expect the post to be created for User A (the authenticated user)
            // regardless of what they sent in the body, OR the request should be rejected.
            // But standard practice is to ignore the body userId and use the token's userId.

            if (response.status === 201) {
                const createdPost = response.body;
                // Ideally, it should be attributed to User A
                expect(createdPost.userId).toBe(userA.id);
                expect(createdPost.userId).not.toBe(userB.id);
            } else {
                // Or maybe it fails validation if we remove userId from body requirement later
                 expect(response.status).not.toBe(500);
            }
        });

         it('should require authentication to create a post', async () => {
            const response = await request(app)
                .post('/api/posts')
                .send({
                    content: 'Anonymous post',
                    userId: userA.id
                });

            expect(response.status).toBe(401);
        });
    });
});
