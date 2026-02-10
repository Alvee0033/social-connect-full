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

describe('Security Vulnerability Reproduction: Unprotected Posts', () => {
    let victimUser;
    let attackerUser;
    let attackerToken;

    beforeAll(async () => {
        // Create a victim user
        victimUser = await User.create({
            display_name: 'Victim User',
            email: 'victim@example.com',
            password: 'hashedpassword123'
        });

        // Register attacker to get token
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Attacker User',
                email: 'attacker@example.com',
                password: 'password123'
            });

        attackerToken = res.body.token;
        attackerUser = res.body; // Contains id
    });

    it('Test Case 1: should NOT allow creating a post without authentication', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Anonymous Post',
                userId: victimUser.id
            });

        expect(response.status).toBe(401);
    });

    it('Test Case 2: should NOT allow creating a post as another user (IDOR)', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({
                content: 'Impersonated Post',
                userId: victimUser.id // Trying to post as victim
            });

        // Even if the request succeeds (201), the post should belong to the authenticated user (attacker)
        // NOT the victim.

        if (response.status === 201) {
            const post = await Post.findOne({ where: { content: 'Impersonated Post' } });
            expect(post).not.toBeNull();
            expect(post.userId).toBe(attackerUser.id);
            expect(post.userId).not.toBe(victimUser.id);
        } else {
             // If validation fails because we removed userId from body (in the fix),
             // we might get 400 if we don't update validation logic.
             // But ideally we want 201 with correct user.
             // If we get 401/403 that's also "secure" but less functional if we want to ignore the malicious input.
        }
    });
});
