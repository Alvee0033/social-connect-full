require('dotenv').config();

// Must set JWT_SECRET before app/middleware initialization
process.env.JWT_SECRET = 'test-secret';

const Sequelize = require('sequelize');

// Override the DB configuration for testing
jest.mock('../src/config/db', () => {
    const Sequelize = require('sequelize');

    const sequelize = new Sequelize('sqlite::memory:', {
        logging: false,
    });
    return {
        sequelize,
        connectDB: async () => {},
    };
});

// Since SQLite doesn't support iLike, replace it in the Op object
const { Op } = require('sequelize');
Op.iLike = Op.like;

const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
