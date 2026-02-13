const { setupTestDB, sequelize } = require('./testSetup');
const request = require('supertest');
const app = require('../src/app');

// Important: We need to import testSetup before app in real usage if we relied on env vars there,
// but here we just need the DB setup.

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Tests', () => {
    let user1Token;
    let user1Id;
    let user2Id;

    beforeAll(async () => {
        // Create User 1
        const res1 = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'User 1',
                email: 'user1@example.com',
                password: 'password123'
            });
        user1Token = res1.body.token;
        user1Id = res1.body.id;

        // Create User 2
        const res2 = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'User 2',
                email: 'user2@example.com',
                password: 'password123'
            });
        user2Id = res2.body.id;
    });

    it('should prevent creating a post without authentication', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated post',
                userId: user1Id
            });

        // Currently this returns 201 (VULNERABLE)
        expect(response.status).toBe(401);
    });

    it('should prevent IDOR: creating post for another user', async () => {
        // Authenticate as User 1 but try to post as User 2
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
                content: 'IDOR Post attempt',
                userId: user2Id
            });

        // The system should either:
        // 1. Reject the request (403/400) because of mismatch
        // 2. Or (better) ignore body.userId and use token's userId

        // We will implement strategy 2 (ignore body input for owner)
        if (response.status === 201) {
            expect(response.body.userId).toBe(user1Id);
            expect(response.body.userId).not.toBe(user2Id);
        } else {
            // If the implementation decides to throw error, that's also acceptable security-wise
            // But for this plan we aim for "use req.user.id"
            expect(response.status).not.toBe(201);
        }
    });
});
