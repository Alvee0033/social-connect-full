process.env.NODE_ENV = 'test';
require('dotenv').config();

// Ensure JWT_SECRET is set for tests
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret-key-12345';
}

const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the SQLite connection for tests
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
