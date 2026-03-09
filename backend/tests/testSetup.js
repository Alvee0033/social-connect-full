require('dotenv').config();

// Set up JWT secret for test env to ensure authentication middleware works
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret';
}

const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
