// Set environment variables BEFORE requiring app/middleware
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Tests', () => {

    let attackerToken;
    let attackerId;
    let victimId;

    beforeEach(async () => {
        // Clear DB
        await sequelize.sync({ force: true });

        // Register Attacker
        const attackerRes = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Attacker',
                email: 'attacker@example.com',
                password: 'password123'
            });

        attackerToken = attackerRes.body.token;
        attackerId = attackerRes.body.id;

        // Register Victim
        const victimRes = await request(app)
            .post('/api/auth/register')
            .send({
                display_name: 'Victim',
                email: 'victim@example.com',
                password: 'password123'
            });

        victimId = victimRes.body.id;
    });

    it('should prevent posting as another user (IDOR fix verification)', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({
                content: 'I am impersonating!',
                userId: victimId
            });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBe(attackerId);
        expect(response.body.userId).not.toBe(victimId);
    });

    it('should require authentication to create a post', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated post'
            });

        expect(response.status).toBe(401);
    });
});
