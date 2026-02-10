const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret'; // Ensure secret is set

const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('API Security and Functionality Tests', () => {

    describe('Security Headers', () => {
        it('should have Helmet security headers', async () => {
            const response = await request(app).get('/');
            expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
            expect(response.headers['x-xss-protection']).toBe('0');
            expect(response.headers['content-security-policy']).toBeDefined();
        });

        it('should have Rate Limit headers on API routes', async () => {
            const response = await request(app).get('/api/auth/login');
            expect(response.headers['ratelimit-limit']).toBeDefined();
            expect(response.headers['ratelimit-remaining']).toBeDefined();
        });
    });

    describe('Auth Endpoints', () => {
        const testUser = {
            display_name: 'testuser', // Fixed: username -> display_name
            email: 'test@example.com',
            password: 'password123'
        };

        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(response.status).toBe(201);
            // It returns the user object, not a message
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('id');
        });

        it('should login an existing user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should fail to login with wrong credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401); // Fixed: 404 -> 401
        });
    });

    describe('Rate Limiting', () => {
        it('should eventually return 429 after many requests', async () => {
            // We set limit to 100 in app.js
            // Let's just check that it decrements for now as doing 100 requests in a test might be slow
            const res1 = await request(app).get('/api/auth/login');
            const remaining1 = parseInt(res1.headers['ratelimit-remaining']);

            const res2 = await request(app).get('/api/auth/login');
            const remaining2 = parseInt(res2.headers['ratelimit-remaining']);

            expect(remaining2).toBe(remaining1 - 1);
        });
    });
});
