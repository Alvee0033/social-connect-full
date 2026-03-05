require('dotenv').config();

// Ensure test environment uses SQLite memory database
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    // Force sync database to have a clean state for each test run
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
