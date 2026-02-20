process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret'; // Ensure JWT_SECRET is set for tests

require('dotenv').config();
console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);
const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the real database connection defined in src/config/db.js
    // which reads from .env
    // But since we set NODE_ENV=test, it uses SQLite memory
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
