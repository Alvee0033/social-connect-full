require('dotenv').config();

// Ensure JWT_SECRET is set before app is required
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret';
}

console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);
const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the real database connection defined in src/config/db.js
    // which reads from .env or uses sqlite in memory
    await sequelize.sync({ force: true }); // Use force:true to clear DB between test suites
};

module.exports = { sequelize, setupTestDB };
