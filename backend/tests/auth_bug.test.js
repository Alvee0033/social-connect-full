const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');

beforeAll(async () => { await setupTestDB(); });
afterAll(async () => { await sequelize.close(); });

it('should verify auth works', async () => {
    const res = await request(app).post('/api/auth/register').send({ display_name: 'test', email: 't@t.com', password: '123' });
    const token = res.body.token;

    const postRes = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({ content: 'test' });
    expect(postRes.status).toBe(201);
});
