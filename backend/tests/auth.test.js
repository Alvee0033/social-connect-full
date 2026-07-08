const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');

beforeAll(async () => {
    await setupTestDB();
});
afterAll(async () => {
    await sequelize.close();
});

test('authenticated endpoint', async () => {
    const resReg = await request(app).post('/api/auth/register').send({
        display_name: 'test', email: 'test@test.com', password: 'password'
    });
    const token = resReg.body.token;

    const resPost = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({
        content: 'hello'
    });
});
