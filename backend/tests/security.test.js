const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');

describe('Security Fix Verification', () => {
    let user;

    beforeAll(async () => {
        await setupTestDB();
        user = await User.create({
            display_name: 'Security Test User',
            email: 'security@test.com',
            password: 'password123'
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should NOT allow posting without authentication', async () => {
        // Before fix: This returned 201
        // After fix: Should return 401
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Hacked post',
                // userId is no longer used from body, but even if sent, it should fail auth
                userId: user.id
            });

        expect(response.status).toBe(401);
    });

    it('should allow posting WITH valid authentication', async () => {
        // This confirms the middleware logic bug (id vs userId) is fixed
        // and that we can correctly authenticate.

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Legitimate post'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.User.id).toBe(user.id);
    });

    it('should ignore userId in request body and use authenticated user', async () => {
        // IDOR prevention test
        const otherUser = await User.create({
            display_name: 'Other User',
            email: 'other@test.com',
            password: 'password123'
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Attempting IDOR',
                userId: otherUser.id // Trying to post as Other User
            });

        expect(response.status).toBe(201);
        // The post should belong to the authenticated user (user.id), NOT the one in body (otherUser.id)
        expect(response.body.User.id).toBe(user.id);
        expect(response.body.User.id).not.toBe(otherUser.id);
    });
});
