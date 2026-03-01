process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
require('dotenv').config();

const { sequelize } = require('../src/config/db');
const User = require('../src/models/user.model');
const Post = require('../src/models/post.model');
const Message = require('../src/models/message.model');
const Conversation = require('../src/models/conversation.model');
const Friendship = require('../src/models/friendship.model');

// Set associations manually here or require app if associations are inside app.js
// but since they are in app.js we require app.js AFTER setupTestDB is called in tests
// For now, sync sequelize.

const setupTestDB = async () => {
    await sequelize.sync({ force: true });
};

module.exports = { sequelize, setupTestDB };
