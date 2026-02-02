const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/db');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const jwt = require('jsonwebtoken');

// Match the middleware's fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerabilities', () => {

    describe('Broken Access Control: Post Creation', () => {
        let userA, userB;
        let tokenA;

        beforeEach(async () => {
            await User.destroy({ where: {}, truncate: true });
            await Post.destroy({ where: {}, truncate: true });

            userA = await User.create({
                display_name: 'User A',
                email: 'usera@example.com',
                password: 'password123'
            });

            userB = await User.create({
                display_name: 'User B',
                email: 'userb@example.com',
                password: 'password123'
            });

            // Generate token for User A
            // Note: Middleware currently expects 'userId' but Service sends 'id'.
            // We will fix Middleware to expect 'id' or we generate 'userId' here to make it pass.
            // Since we are Sentinel, we will fix the Middleware bug too.
            // So we sign with 'id' (standard).
            tokenA = jwt.sign({ id: userA.id }, JWT_SECRET);
        });

        it('Should reject unauthenticated requests (401)', async () => {
            const response = await request(app)
                .post('/api/posts')
                .send({
                    content: 'I have no token',
                    imageUrl: 'http://example.com/image.jpg'
                });

            expect(response.status).toBe(401);
        });

        it('Should create post for authenticated user (ignoring body userId)', async () => {
            const response = await request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${tokenA}`)
                .send({
                    content: 'I am User A but I try to post as User B',
                    userId: userB.id, // malicious attempt
                    imageUrl: 'http://example.com/image.jpg'
                });

            expect(response.status).toBe(201);

            // It should be created for User A (from token), NOT User B
            expect(response.body.userId).toBe(userA.id);
            expect(response.body.userId).not.toBe(userB.id);

            // Verify in DB
            const post = await Post.findOne({ where: { content: 'I am User A but I try to post as User B' } });
            expect(post.userId).toBe(userA.id);
        });
    });
});
