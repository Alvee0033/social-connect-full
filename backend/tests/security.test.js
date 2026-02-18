const request = require('supertest');

// Set env vars before requiring app
process.env.JWT_SECRET = 'test_secret';

const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

beforeEach(async () => {
    await sequelize.sync({ force: true });
});

describe('Security Vulnerabilities', () => {

    describe('IDOR and Auth Bypass in Post Creation', () => {
        let user1;
        let user2;
        let token1;

        beforeEach(async () => {
            // Create user 1
            const res1 = await request(app)
                .post('/api/auth/register')
                .send({
                    display_name: 'User One',
                    email: 'user1@example.com',
                    password: 'password123'
                });
            user1 = res1.body;
            token1 = res1.body.token;

            // Create user 2
            const res2 = await request(app)
                .post('/api/auth/register')
                .send({
                    display_name: 'User Two',
                    email: 'user2@example.com',
                    password: 'password123'
                });
            user2 = res2.body;
        });

        it('should fail to create a post without authentication', async () => {
            const response = await request(app)
                .post('/api/posts')
                .send({
                    content: 'Unauthenticated post',
                    userId: user1.id
                });

            // Should be 401 Unauthorized
            expect(response.status).toBe(401);
        });

        it('should create post for authenticated user even if another userId is sent (prevent IDOR)', async () => {
            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    content: 'IDOR Attack Post',
                    userId: user2.id // Attacker tries to post as user2
                });

            // Ideally it should succeed (201) but create it for user1 (the token owner)
            // Or fail (400/403) if we strictly validate body vs token.
            // But standard secure design often just ignores the body param if auth is present.
            // Let's assume we want to fix it by using req.user.id.

            expect(response.status).toBe(201);

            // The returned post should belong to user1, NOT user2
            expect(response.body.userId).toBe(user1.id);
            expect(response.body.userId).not.toBe(user2.id);
        });
    });
});
