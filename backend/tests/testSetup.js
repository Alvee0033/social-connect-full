require('dotenv').config();

// Ensure JWT_SECRET is set for tests
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret';
}

console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);
const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    // Sync models (creates tables in SQLite memory DB)
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
