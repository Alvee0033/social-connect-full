const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Fix Verification', () => {

    it('should prevent creating a post without authentication', async () => {
        const postRes = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated post',
                userId: 123 // Should be ignored or rejected
            });

        expect(postRes.status).toBe(401);
    });

    it('should prevent reacting to a post without authentication', async () => {
        // Need a post first. Can't create one without auth now :)
        // So we need to register a user and create a post first.
        const user = await request(app).post('/api/auth/register').send({
            display_name: 'Poster',
            email: 'poster@example.com',
            password: 'password'
        });
        const token = user.body.token;

        const postRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'My Post' });

        const postId = postRes.body.id;

        const reactRes = await request(app)
            .post(`/api/posts/${postId}/react`); // No token

        expect(reactRes.status).toBe(401);
    });

    it('should prevent IDOR: user cannot create post for another user even with userId in body', async () => {
        // 1. Create Victim "Alice"
        const aliceRes = await request(app).post('/api/auth/register').send({
            display_name: 'Alice',
            email: 'alice@example.com',
            password: 'password123'
        });
        const aliceId = aliceRes.body.id;

        // 2. Create Attacker "Bob"
        const bobRes = await request(app).post('/api/auth/register').send({
            display_name: 'Bob',
            email: 'bob@example.com',
            password: 'password123'
        });
        const bobToken = bobRes.body.token;
        const bobId = bobRes.body.id;

        // 3. Bob tries to create a post for Alice
        const postRes = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${bobToken}`)
            .send({
                content: 'I am Bob trying to be Alice',
                userId: aliceId // Malicious attempt
            });

        // 4. Verify post is created but assigned to Bob (or ignored userId)
        expect(postRes.status).toBe(201);
        expect(postRes.body.userId).toBe(bobId); // Should be Bob's ID
        expect(postRes.body.userId).not.toBe(aliceId); // Should NOT be Alice's ID
    });
});
