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
    let aliceToken;
    let aliceId;
    let bobId;

    beforeAll(async () => {
        // Create Alice
        const aliceRes = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Alice',
                email: 'alice@example.com',
                password: 'password123'
            });
        aliceToken = aliceRes.body.token;
        aliceId = aliceRes.body.id;

        // Create Bob
        const bobRes = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Bob',
                email: 'bob@example.com',
                password: 'password123'
            });
        bobId = bobRes.body.id;
    });

    it('should NOT allow unauthenticated post creation', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Hacked post',
                userId: bobId
            });

        // Currently passes (returns 201) because no auth middleware
        // We expect 401 Unauthorized
        expect(response.status).toBe(401);
    });

    it('should NOT allow IDOR: creating post for another user', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${aliceToken}`)
            .send({
                content: 'IDOR post',
                userId: bobId
            });

        // With the fix, it should create the post for the authenticated user (Alice)
        // ignoring the spoofed userId (Bob) in the body
        expect(response.status).toBe(201);
        expect(response.body.User.id).toBe(aliceId);
        expect(response.body.User.id).not.toBe(bobId);
    });
});
