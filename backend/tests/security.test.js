const { setupTestDB, sequelize } = require('./testSetup');
const request = require('supertest');
const app = require('../src/app');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Tests', () => {

    describe('IDOR in Post Creation', () => {
        let userA, userB, tokenA;

        beforeEach(async () => {
            // Clear users before each test to avoid conflicts
            await sequelize.models.User.destroy({ where: {}, truncate: true });
            await sequelize.models.Post.destroy({ where: {}, truncate: true });

            // Create User A
            const resA = await request(app)
                .post('/api/auth/register')
                .send({
                    display_name: 'User A',
                    email: 'usera@example.com',
                    password: 'password123'
                });
            userA = resA.body;
            tokenA = userA.token;

            // Create User B
            const resB = await request(app)
                .post('/api/auth/register')
                .send({
                    display_name: 'User B',
                    email: 'userb@example.com',
                    password: 'password123'
                });
            userB = resB.body;
        });

        it('should NOT allow User A to create a post for User B', async () => {
            const postData = {
                content: 'This is a post by User A pretending to be User B',
                userId: userB.id // Trying to spoof User B
            };

            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${tokenA}`)
                .send(postData);

            // Expectation: The post should be created for User A (ignoring the spoofed ID)
            // OR the request should fail if strict checking is enforced.
            // For this fix, we will enforce using the token's user ID.

            // If the vulnerability exists, the post will be created for User B.
            // So we expect the response body to have User A's ID or fail.

            // Currently (VULNERABLE), this returns 201 and the post belongs to User B.
            // So this test SHOULD FAIL until we fix it.

            // Note: If the endpoint is not protected, it might return 201.
            // If it is protected but uses body userId, it returns 201.

            expect(response.status).toBe(201);

            // Verify the post belongs to User A, NOT User B
            expect(response.body.userId).not.toBe(userB.id);
            expect(response.body.userId).toBe(userA.id);
        });
    });
});
