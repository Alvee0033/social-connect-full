const request = require('supertest');
// Set JWT_SECRET before requiring app/middleware as some modules might read it at load time
process.env.JWT_SECRET = 'test-secret';

const app = require('../src/app');
const { setupTestDB, sequelize } = require('./testSetup');
const User = require('../src/models/user.model');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Security Vulnerability Reproduction', () => {
    let user;

    beforeEach(async () => {
        // Clear DB
        await sequelize.sync({ force: true });

        // Create a user to target
        user = await User.create({
            display_name: 'Victim',
            email: 'victim@example.com',
            password: 'password123'
        });
    });

    test('Should prevent creating a post without authentication (IDOR/Unauthorized)', async () => {
        const response = await request(app)
            .post('/api/posts')
            .send({
                content: 'Hacked post',
                userId: user.id // Trying to post as the user without logging in
            });

        // Current behavior: 201 Created (VULNERABLE)
        // Desired behavior: 401 Unauthorized

        // If this expectation fails (received 201), the vulnerability is present.
        expect(response.status).toBe(401);
    });

    test('Should create post with logged-in user ID even if different userId is provided in body', async () => {
        const jwt = require('jsonwebtoken');

        // Create another user (Attacker)
        const attacker = await User.create({
            display_name: 'Attacker',
            email: 'attacker@example.com',
            password: 'password123'
        });

        // Login as attacker
        const token = jwt.sign({ id: attacker.id }, process.env.JWT_SECRET);

        const response = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'I am masquerading',
                userId: user.id // Trying to post as the victim
            });

        expect(response.status).toBe(201);

        // Verify the post was created with the attacker's ID, not the victim's
        // Note: The response returns the post with user info included
        expect(response.body.userId).toBe(attacker.id);
        expect(response.body.userId).not.toBe(user.id);

        // Double check the user object in response
        expect(response.body.User.email).toBe(attacker.email);
    });
});
