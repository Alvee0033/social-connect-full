const { setupTestDB, sequelize } = require('./testSetup');
const request = require('supertest');
const app = require('../src/app');

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await sequelize.close();
});

describe('Message Auth Vulnerability', () => {

    it('should NOT allow user1 to send message to user2 if they are not friends', async () => {
        const u1Res = await request(app).post('/api/auth/register').send({ display_name: 'U1x', email: 'u1x@test.com', password: 'pw' });
        const u2Res = await request(app).post('/api/auth/register').send({ display_name: 'U2x', email: 'u2x@test.com', password: 'pw' });

        const response = await request(app)
            .post('/api/messages/send')
            .set('Authorization', `Bearer ${u1Res.body.token}`)
            .send({ receiverId: u2Res.body.id, content: 'Spam!' });

        expect(response.status).toBe(403);
    });
});
