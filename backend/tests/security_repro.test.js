const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Reproduction Tests', () => {
    let user;
    let token;

    beforeEach(async () => {
        // Clean up users before each test
        await User.destroy({ where: {}, truncate: true, cascade: true });

        user = await User.create({
            display_name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    describe('VULNERABILITY: Unprotected Post Creation', () => {
        it('should REJECT creating a post WITHOUT a token', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({
                    content: 'Hacked post',
                    userId: user.id
                });

            expect(res.status).toBe(401);
        });

        it('should allow creating a post WITH a token', async () => {
            const res = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'Legit post',
                    // userId is NOT required in body anymore, inferred from token
                });

            expect(res.status).toBe(201);
            // Verify the post was created for the correct user
            expect(res.body.User.email).toBe(user.email);
        });
    });

    describe('BUG: Broken Auth Middleware', () => {
        // We test a route that USES the middleware: /api/messages/conversations
        // This should now PASS because we fixed the middleware
        it('should authenticate successfully with valid token', async () => {
            const res = await request(app)
                .get('/api/messages/conversations')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
        });
    });
});
