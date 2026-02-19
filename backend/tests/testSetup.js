process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret'; // Ensure JWT secret is set

const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
