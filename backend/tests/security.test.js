const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = 'test-secret';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

// Clear database before each test
beforeEach(async () => {
    await sequelize.sync({ force: true });
});

describe('Critical Security Vulnerability: IDOR in Post Creation', () => {

    it('should reject unauthenticated post creation', async () => {
        // Create a user first so we have a valid userId to verify against
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Victim User',
                email: 'victim@example.com',
                password: 'password123'
            });

        const victimId = userRes.body.id;

        // Attempt to create a post as the victim WITHOUT authentication
        const postRes = await request(app)
            .post('/api/posts')
            .send({
                content: 'Hacked Post',
                userId: victimId
            });

        // Currently this fails (returns 201)
        expect(postRes.status).toBe(401);
    });

    it('should create post as the authenticated user, ignoring body userId', async () => {
        // Create User A (Attacker)
        const attackerRes = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Attacker',
                email: 'attacker@example.com',
                password: 'password123'
            });
        const attackerToken = attackerRes.body.token;
        const attackerId = attackerRes.body.id;

        // Create User B (Victim)
        const victimRes = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Victim',
                email: 'victim2@example.com',
                password: 'password123'
            });
        const victimId = victimRes.body.id;

        // Attacker tries to post as Victim
        const postRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({
                content: 'Impersonated Post',
                userId: victimId // Spoofing ID
            });

        // Should be successful but created as Attacker
        expect(postRes.status).toBe(201);
        expect(postRes.body.userId).toBe(attackerId);
        expect(postRes.body.userId).not.toBe(victimId);
    });

});
