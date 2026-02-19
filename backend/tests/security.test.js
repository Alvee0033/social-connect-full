// Set env vars BEFORE requiring app
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');
const User = require('../src/models/user.model');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerabilities', () => {

    describe('IDOR in Post Creation', () => {
        let user1Token;
        let user1Id;
        let user2Id;

        beforeAll(async () => {
            // Create User 1
            const res1 = await request(app)
                .post('/api/auth/register')
                .send({
                    display_name: 'User One',
                    email: 'user1@example.com',
                    password: 'password123'
                });
            user1Token = res1.body.token;
            user1Id = res1.body.id;

            // Create User 2
            const res2 = await request(app)
                .post('/api/auth/register')
                .send({
                    display_name: 'User Two',
                    email: 'user2@example.com',
                    password: 'password123'
                });
            user2Id = res2.body.id;
        });

        it('should NOT allow creating a post for another user (IDOR Fixed)', async () => {
            // User 1 tries to create a post for User 2
            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({
                    content: 'Hacked Post',
                    userId: user2Id // Attempt to spoof User 2
                });

            expect(response.status).toBe(201);
            // The post should be created for User 1, IGNORING the userId in the body
            expect(response.body.userId).toBe(user1Id);
            expect(response.body.userId).not.toBe(user2Id);
            expect(response.body.content).toBe('Hacked Post');
        });

        it('should NOT allow creating a post without authentication', async () => {
             const response = await request(app)
                .post('/api/posts')
                .send({
                    content: 'Anonymous Post',
                    userId: user2Id
                });

            expect(response.status).toBe(401);
        });
    });
});
