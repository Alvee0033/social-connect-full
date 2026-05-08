require('dotenv').config();

// Must set JWT_SECRET before app/middleware initialization
process.env.JWT_SECRET = 'test-secret';

const Sequelize = require('sequelize');

// Override the DB configuration for testing
jest.mock('../src/config/db', () => {
    const Sequelize = require('sequelize');
    // Mock Op.iLike to Op.like for SQLite
    const Op = Sequelize.Op;
    if (!Op.iLike) {
        Op.iLike = Op.like;
    }

    const sequelize = new Sequelize('sqlite::memory:', {
        logging: false,
    });
    return {
        sequelize,
        connectDB: async () => {},
    };
});

const { sequelize } = require('../src/config/db');

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
