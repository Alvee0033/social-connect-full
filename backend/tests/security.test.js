const { sequelize, setupTestDB } = require('./testSetup'); // Import first to set env vars
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Check', () => {
    let attacker;
    let victim;
    let attackerToken;

    beforeEach(async () => {
        // Clear tables to ensure clean state
        await Post.destroy({ where: {}, truncate: true });
        await User.destroy({ where: {}, truncate: true });

        // Create attacker
        attacker = await User.create({
            display_name: 'Attacker User',
            email: 'attacker@example.com',
            password: 'password123'
        });

        // Create victim
        victim = await User.create({
            display_name: 'Victim User',
            email: 'victim@example.com',
            password: 'password123'
        });

        // Login as attacker to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'attacker@example.com',
                password: 'password123'
            });
        attackerToken = loginRes.body.token;
    });

    it('should fail to create a post without authentication', async () => {
        const postData = {
            content: 'Anonymous Post',
        };

        const response = await request(app)
            .post('/api/posts')
            .send(postData);

        expect(response.status).toBe(401);
    });

    it('should NOT allow creating a post for another user (IDOR prevention)', async () => {
        // Attacker tries to create a post for Victim
        const postData = {
            content: 'Malicious Post by Attacker disguised as Victim',
            userId: victim.id // Trying to impersonate victim
        };

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${attackerToken}`)
            .send(postData);

        expect(response.status).toBe(201);

        // The post should be created, BUT the userId should be the ATTACKER'S ID, not the victim's
        expect(response.body.content).toBe(postData.content);
        expect(response.body.User.id).toBe(attacker.id); // Should be attacker
        expect(response.body.User.id).not.toBe(victim.id); // Should NOT be victim
    });
});
