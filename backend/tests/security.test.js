const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Reproduction', () => {
    let user1, user2;
    let token1;

    beforeEach(async () => {
        // Clear DB - using truncate to be faster/cleaner
        await sequelize.sync({ force: true });

        // Create users
        user1 = await User.create({
            display_name: 'User One',
            email: 'user1@example.com',
            password: 'password123'
        });

        user2 = await User.create({
            display_name: 'User Two',
            email: 'user2@example.com',
            password: 'password123'
        });

        token1 = jwt.sign({ id: user1.id }, process.env.JWT_SECRET);
    });

    it('should deny post creation without token', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthenticated post',
                userId: user1.id
            });

        // Currently returns 201 because no auth middleware
        expect(response.status).toBe(401);
    });

    it('should ignore userId in body and use authenticated user id', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token1}`)
            .send({
                content: 'Impersonation attempt',
                userId: user2.id // Trying to post as user2
            });

        // Currently returns 201 and uses body.userId
        expect(response.status).toBe(201);

        const post = await Post.findByPk(response.body.id);
        expect(post.userId).toBe(user1.id);
        expect(post.userId).not.toBe(user2.id);
    });
});
