require('dotenv').config();
console.log('DB_PASS loaded:', process.env.DB_PASS ? 'Yes' : 'No');
console.log('DB_HOST:', process.env.DB_HOST);

// Ensure JWT_SECRET is available for tests
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret';
}

// Override DB connection to use sqlite for tests
process.env.DB_DIALECT = 'sqlite';

const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
});

// Patch the original exported db module so that app models use sqlite
const dbConfig = require('../src/config/db');
dbConfig.sequelize = sequelize;

// Force models to use the sqlite sequelize instance
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const Message = require('../src/models/message.model');
const Conversation = require('../src/models/conversation.model');
const Friendship = require('../src/models/friendship.model');

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
