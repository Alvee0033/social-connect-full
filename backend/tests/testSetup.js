require('dotenv').config();
console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);

// Set JWT_SECRET for testing if not present
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret';
}

const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the real database connection defined in src/config/db.js
    // which reads from .env
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
