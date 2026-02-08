const { setupTestDB, sequelize } = require('./testSetup');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const jwt = require('jsonwebtoken');

beforeEach(async () => {
    await setupTestDB();
});

describe('Security Vulnerability Tests', () => {

    it('should prevent unauthenticated users from creating posts', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated post',
                userId: 'some-id'
            });

        expect(response.status).toBe(401);
    });

    it('should prevent IDOR: User A cannot create a post for User B (post is created for User A)', async () => {
        // 1. Create User A
        const userA = await User.create({
            display_name: 'User A',
            email: 'usera@example.com',
            password: 'password123'
        });

        // 2. Create User B
        const userB = await User.create({
            display_name: 'User B',
            email: 'userb@example.com',
            password: 'password123'
        });

        // Generate token for User A
        const token = jwt.sign({ id: userA.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // 3. User A tries to create a post for User B
        const postContent = 'Attempting IDOR';

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: postContent,
                userId: userB.id // Malicious payload
            });

        // 4. Verify post creation succeeds (201) but for the CORRECT user
        expect(response.status).toBe(201);

        // 5. Verify the post is attributed to User A, NOT User B
        const post = await Post.findOne({ where: { content: postContent } });
        expect(post).not.toBeNull();
        expect(post.userId).toBe(userA.id);
        expect(post.userId).not.toBe(userB.id);
    });
});
