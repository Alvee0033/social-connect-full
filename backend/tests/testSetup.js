require('dotenv').config();
process.env.JWT_SECRET = 'test-secret'; // Ensure JWT_SECRET is set for tests

console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);
const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the real database connection defined in src/config/db.js
    // which reads from .env
    await sequelize.sync();
};

module.exports = { sequelize, setupTestDB };
