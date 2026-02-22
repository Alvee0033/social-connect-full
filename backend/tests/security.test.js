// Set environment variables BEFORE requiring app/models
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { sequelize } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');

beforeAll(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
    } catch (err) {
        console.error('Test DB setup failed:', err);
    }
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Verification', () => {

    // Test Data
    const victimUserData = {
        display_name: 'Victim User',
        email: 'victim@example.com',
        password: 'password123'
    };

    const attackerUserData = {
        display_name: 'Attacker User',
        email: 'attacker@example.com',
        password: 'password123'
    };

    let victimUser;
    let attackerUser;
    let attackerToken;

    beforeEach(async () => {
        // Clear DB
        await sequelize.sync({ force: true });

        // Create users
        victimUser = await User.create(victimUserData);
        attackerUser = await User.create(attackerUserData);

        // Login attacker to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: attackerUserData.email,
                password: attackerUserData.password
            });

        attackerToken = loginRes.body.token;

        if (!attackerToken) {
            throw new Error('Failed to get attacker token. Login response: ' + JSON.stringify(loginRes.body));
        }
    });

    it('FIX VERIFIED: Unauthenticated user CANNOT create post', async () => {
        const postData = {
            content: 'Hacked post content',
            userId: victimUser.id
        };

        const response = await request(app)
            .post('/api/posts')
            .send(postData);

        // Expectation: Should fail with 401 Unauthorized
        expect(response.status).toBe(401);

        // Verify post was NOT created
        const posts = await Post.findAll({ where: { userId: victimUser.id } });
        expect(posts).toHaveLength(0);
    });

    it('FIX VERIFIED: Authenticated user CANNOT create post for another user (IDOR prevented)', async () => {
        const postData = {
            content: 'IDOR attack content',
            userId: victimUser.id // Trying to create for victim
        };

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${attackerToken}`)
            .send(postData);

        // Expectation: Should succeed (201) because user is authenticated
        // BUT it should create the post for the ATTACKER (req.user.id), ignoring body.userId
        expect(response.status).toBe(201);

        // Verify post was NOT created for VICTIM
        const victimPosts = await Post.findAll({ where: { userId: victimUser.id } });
        expect(victimPosts).toHaveLength(0);

        // Verify post WAS created for ATTACKER
        const attackerPosts = await Post.findAll({ where: { userId: attackerUser.id } });
        expect(attackerPosts).toHaveLength(1);
        expect(attackerPosts[0].content).toBe('IDOR attack content');
    });

});
