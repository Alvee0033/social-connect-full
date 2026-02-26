process.env.JWT_SECRET = 'test-secret'; // Set before imports!

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

describe('Security Vulnerability Fix Verification', () => {
    let token;
    let userId;
    let otherUserId;

    beforeEach(async () => {
        // Clear DB
        await Post.destroy({ where: {} });
        await User.destroy({ where: {} });

        // Create main user (Attacker)
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Attacker',
                email: 'attacker@example.com',
                password: 'password123'
            });

        if (res.status !== 201) {
            console.error('Registration failed:', res.body);
        }

        userId = res.body.id;
        token = res.body.token;

        // Create victim user
        const victim = await User.create({
            display_name: 'Victim',
            email: 'victim@example.com',
            password: 'password123'
        });
        otherUserId = victim.id;
    });

    test('FIXED: Cannot create post without authentication', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated Post',
                // userId is no longer required in body
            });

        expect(response.status).toBe(401);
    });

    test('FIXED: IDOR - Cannot create post for another user (Post is created for authenticated user)', async () => {
        expect(otherUserId).toBeDefined();

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`) // Authenticated as 'Attacker'
            .send({
                content: 'Impersonated Post',
                userId: otherUserId // Trying to post as 'Victim'
            });

        expect(response.status).toBe(201);

        const post = await Post.findOne({ where: { content: 'Impersonated Post' } });
        expect(post).not.toBeNull();
        if (post) {
            // The post should belong to the authenticated user (Attacker), not the victim
            expect(post.userId).toBe(userId);
            expect(post.userId).not.toBe(otherUserId);
        }
    });
});
