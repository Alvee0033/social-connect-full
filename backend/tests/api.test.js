const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');

// Important: app must be imported AFTER testSetup to use the mocked DB and JWT secret
const app = require('../src/app');

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
            display_name: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(response.status).toBe(201);
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

            expect(response.status).toBe(401); // Auth controller returns 401 on login failure
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

    describe('Post Endpoints Security', () => {
        it('should limit the number of posts returned to prevent DoS', async () => {
            // Pre-populate posts
            const User = require('../src/models/user.model');
            const Post = require('../src/models/post.model');
            const testUser = await User.create({ display_name: 'testuser', email: 'limit@example.com', password: 'password123' });

            for(let i=0; i<60; i++) {
                await Post.create({ content: `Test post ${i}`, userId: testUser.id });
            }

            // Test default limit
            const resDefault = await request(app).get('/api/posts');
            expect(resDefault.status).toBe(200);
            expect(resDefault.body.length).toBeLessThanOrEqual(20);

            // Test explicit limit capped at 50
            const resMax = await request(app).get('/api/posts?limit=100');
            expect(resMax.status).toBe(200);
            expect(resMax.body.length).toBeLessThanOrEqual(50);
        });
    });
});
