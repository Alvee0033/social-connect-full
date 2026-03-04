require('dotenv').config();
console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);

process.env.JWT_SECRET = 'test-secret'; // ensure JWT_SECRET is set for tests

const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the real database connection defined in src/config/db.js
    // which reads from .env
    await sequelize.sync({ force: true }); // drop tables before each test suite
};

module.exports = { sequelize, setupTestDB };
