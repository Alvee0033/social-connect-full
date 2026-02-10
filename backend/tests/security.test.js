// Must be imported first to set up environment variables
const { setupTestDB, sequelize } = require('./testSetup');

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Fix Verification', () => {
    let testUser;
    let token;
    let attackerUser;
    let attackerToken;

    beforeEach(async () => {
        await User.destroy({ where: {} });
        await Post.destroy({ where: {} });

        testUser = await User.create({
            display_name: 'Valid User',
            email: 'valid@example.com',
            password: 'password123'
        });

        attackerUser = await User.create({
            display_name: 'Attacker User',
            email: 'attacker@example.com',
            password: 'password123'
        });

        // Generate tokens
        token = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET);
        attackerToken = jwt.sign({ id: attackerUser.id }, process.env.JWT_SECRET);
    });

    it('should REJECT creating a post without authentication', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Unauthorized Post'
            });

        expect(response.status).toBe(401);
    });

    it('should ALLOW creating a post with valid authentication', async () => {
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Authorized Post'
            });

        expect(response.status).toBe(201);
        expect(response.body.content).toBe('Authorized Post');
        expect(response.body.userId).toBe(testUser.id);
    });

    it('should IGNORE spoofed userId in body and use authenticated user ID', async () => {
        // Attacker tries to create a post as 'testUser'
        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${attackerToken}`)
            .send({
                content: 'Spoofed Post',
                userId: testUser.id // Trying to impersonate testUser
            });

        expect(response.status).toBe(201);

        // The post should belong to the attacker, NOT the victim (testUser)
        const post = await Post.findOne({ where: { content: 'Spoofed Post' } });
        expect(post.userId).toBe(attackerUser.id);
        expect(post.userId).not.toBe(testUser.id);
    });

    it('should REJECT reacting to a post without authentication', async () => {
        const post = await Post.create({
            content: 'Test Post',
            userId: testUser.id
        });

        const response = await request(app)
            .post(`/api/posts/${post.id}/react`)
            .send();

        expect(response.status).toBe(401);
    });
});
