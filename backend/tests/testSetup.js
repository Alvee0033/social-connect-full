require('dotenv').config();

// Must set JWT_SECRET before app/middleware initialization
process.env.JWT_SECRET = 'test-secret';

// Mock sequelize to replace Op.iLike with Op.like globally
jest.mock('sequelize', () => {
    const originalModule = jest.requireActual('sequelize');
    const { Op } = originalModule;

    const OpProxy = new Proxy(Op, {
        get(target, prop) {
            if (prop === 'iLike') {
                return target.like; // SQLite doesn't support iLike, use like instead
            }
            return target[prop];
        }
    });

    return {
        ...originalModule,
        Op: OpProxy
    };
});

// Override the DB configuration for testing
jest.mock('../src/config/db', () => {
    const { Sequelize } = jest.requireActual('sequelize');
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
