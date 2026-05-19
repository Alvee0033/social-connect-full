const request = require('supertest');
const { setupTestDB, sequelize } = require('./testSetup');
const app = require('../src/app');

beforeAll(async () => {
    await setupTestDB();
    const User = require('../src/models/user.model');
    await User.create({ display_name: 'test', email: 'test1@example.com', password: 'password123' });
});

afterAll(async () => {
    await sequelize.close();
});

it('should fail with 401 on unauthenticated search', async () => {
    const response = await request(app).get('/api/users/search?query=test');
    expect(response.status).toBe(401);
});
