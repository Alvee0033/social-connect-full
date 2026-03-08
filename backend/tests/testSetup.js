require('dotenv').config();

// Ensure JWT_SECRET is set for tests to prevent "secretOrPrivateKey must have a value" error
process.env.JWT_SECRET = 'test-jwt-secret';

console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);
const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the database connection defined in src/config/db.js
    // which uses sqlite::memory: when NODE_ENV is 'test'
    await sequelize.sync({ force: true }); // Use force: true to clean state between runs
};

module.exports = { sequelize, setupTestDB };
