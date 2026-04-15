require('dotenv').config();

// Must set JWT_SECRET before app/middleware initialization
process.env.JWT_SECRET = 'test-secret';

const Sequelize = require('sequelize');

// Mock Sequelize to replace ILIKE with LIKE for SQLite memory DB
const OriginalOp = Sequelize.Op;
Sequelize.Op = { ...OriginalOp, iLike: OriginalOp.like };

// Override the DB configuration for testing
jest.mock('../src/config/db', () => {
    const Sequelize = require('sequelize');
    const OriginalOp = Sequelize.Op;
    Sequelize.Op = { ...OriginalOp, iLike: OriginalOp.like };

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
