require('dotenv').config();
process.env.JWT_SECRET = 'test-secret';
const Sequelize = require('sequelize');

// Override sequelize for tests to use an in-memory SQLite database
const sequelize = new Sequelize('sqlite::memory:', { logging: false });

// We need to inject this mock sequelize into the models before they are used
// But since models require the DB configuration, we'll patch the exported sequelize object
const dbConfig = require('../src/config/db');
dbConfig.sequelize = sequelize;

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
