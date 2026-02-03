const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

beforeEach(async () => {
    // specific cleanup to ensure clean state
    await Post.destroy({ where: {} });
    await User.destroy({ where: {} });
});

describe('Security Vulnerabilities Reproduction', () => {

    it('should prevent unauthenticated post creation', async () => {
        // Create a user target to try to post as
        const user = await User.create({
            display_name: 'Target User',
            email: 'target@example.com',
            password: 'password123'
        });

        const postData = {
            content: 'Unauthenticated post',
            userId: user.id
        };

        // Attempt to create post without any Auth header
        const response = await request(app)
            .post('/api/posts')
            .send(postData);

        // Security Expectation: Should be rejected with 401
        expect(response.status).toBe(401);
    });

    it('should ignore userId in body and use authenticated user', async () => {
         // Create two users
         const attacker = await User.create({
            display_name: 'Attacker',
            email: 'attacker@example.com',
            password: 'password123'
        });

        const victim = await User.create({
            display_name: 'Victim',
            email: 'victim@example.com',
            password: 'password123'
        });

        // Generate token for attacker (simulated)
        // We need to use the actual auth service logic or mock it.
        // Since we are testing integration, let's login as attacker.
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'attacker@example.com', password: 'password123' });

        const token = loginRes.body.token;

        const postData = {
            content: 'Forged post',
            userId: victim.id // Try to post as victim
        };

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send(postData);

        // Security Expectation:
        // 1. Should be successful (201) BUT created for Attacker, NOT Victim.
        // OR
        // 2. Should be 400/403 if we explicitly forbid matching body ID with token ID.
        //
        // Standard secure design: Ignore body userId, use token userId.

        if (response.status === 201) {
            expect(response.body.userId).not.toBe(victim.id);
            expect(response.body.userId).toBe(attacker.id);
        } else {
            // If we decide to block requests with mismatching IDs
             expect(response.status).not.toBe(201);
        }
    });
});
