process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
require('dotenv').config();

console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);
const { sequelize, connectDB } = require('../src/config/db');

const setupTestDB = async () => {
    // We use the database connection defined in src/config/db.js
    // which handles NODE_ENV='test' by using sqlite memory
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
    } catch (err) {
        console.error('Test DB Setup Error:', err);
        throw err;
    }
};

module.exports = { sequelize, setupTestDB };
