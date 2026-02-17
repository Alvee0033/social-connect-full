// Set environment variables for testing BEFORE requiring app/db
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    // Force sync to clear database and recreate tables
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
