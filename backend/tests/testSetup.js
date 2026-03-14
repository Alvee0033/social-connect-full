require('dotenv').config();

// Ensure test JWT secret is set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const { Sequelize } = require('sequelize');

// Override real DB with in-memory SQLite for tests
const sequelize = new Sequelize('sqlite::memory:', { logging: false });
const dbConfig = require('../src/config/db');
dbConfig.sequelize = sequelize;
dbConfig.connectDB = async () => {}; // mock connectDB

// Require models after mocking the sequelize connection
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const Message = require('../src/models/message.model');
const Conversation = require('../src/models/conversation.model');
const Friendship = require('../src/models/friendship.model');

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
