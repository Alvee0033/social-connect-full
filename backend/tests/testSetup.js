require('dotenv').config();

// Ensure JWT_SECRET is set for tests if not in .env
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret';
}

console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);
const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the real database connection defined in src/config/db.js
    // which reads from .env
    await sequelize.sync();
};

module.exports = { sequelize, setupTestDB };
