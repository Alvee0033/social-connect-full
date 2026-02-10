const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security: Broken Access Control', () => {
    let user1;
    let token1;
    let user2;

    beforeEach(async () => {
        // Clear users and posts before each test to ensure clean state
        // Since setupTestDB only syncs, we might need to truncate
        await User.destroy({ where: {}, truncate: true, cascade: true });

        // Create a user
        user1 = await User.create({
            display_name: 'User One',
            email: 'user1@example.com',
            password: 'password123'
        });

        // Generate token (using the same logic as auth service)
        token1 = jwt.sign({ id: user1.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create another user (the victim)
        user2 = await User.create({
            display_name: 'User Two',
            email: 'user2@example.com',
            password: 'password123'
        });
    });

    it('should prevent unauthenticated users from creating posts', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Hacker post'
            });

        expect(response.status).toBe(401);
    });

    it('should allow authenticated users to create posts', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                content: 'Legitimate post'
            });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBe(user1.id);
    });

    it('should ignore spoofed userId in request body', async () => {
        // Attacker tries to create a post as User Two
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                content: 'Spoofed post',
                userId: user2.id // Trying to impersonate user2
            });

        expect(response.status).toBe(201);

        // The post should belong to user1 (the token holder), NOT user2
        expect(response.body.userId).toBe(user1.id);
        expect(response.body.userId).not.toBe(user2.id);
    });
});
