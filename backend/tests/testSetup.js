process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

require('dotenv').config();

const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    // Force sync (creates tables)
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
