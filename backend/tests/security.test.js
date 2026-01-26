const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Reproduction Tests', () => {
    let token;
    let userId;
    let otherUserId;

    beforeEach(async () => {
        // Clear users to avoid unique constraint errors if tests re-run
        // In sqlite memory this might not be needed but good practice
        await User.destroy({ where: {}, truncate: true });

        // Create a user
        const user = await User.create({
            display_name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        userId = user.id;

        // Login to get token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        token = res.body.token;

        // Create another user
        const otherUser = await User.create({
            display_name: 'Other User',
            email: 'other@example.com',
            password: 'password123'
        });
        otherUserId = otherUser.id;
    });

    it('should prevent creating a post without authentication', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Hacked post',
                userId: userId
            });

        // Currently this succeeds (201) because no auth middleware
        expect(response.status).toBe(401);
    });

    it('should ignore userId in body and use authenticated user', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Post with faked ID',
                userId: otherUserId // Trying to post as other user
            });

        // Currently this uses otherUserId
        // We expect it to use the token's user (userId)

        expect(response.status).toBe(201);
        // The controller returns the post with the user object
        expect(response.body.User.id).toBe(userId);
        expect(response.body.User.id).not.toBe(otherUserId);
    });

    it('should allow access to protected routes with valid token', async () => {
        // Message routes are protected by auth middleware
        // Currently auth middleware is broken (userId vs id), so this fails with 401
        const response = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });
});
