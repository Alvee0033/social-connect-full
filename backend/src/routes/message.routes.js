const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes are protected
router.use(authenticateToken);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get or create conversation with specific user
router.get('/conversations/user/:userId', messageController.getOrCreateConversation);

// Get messages in a conversation
router.get('/conversations/:conversationId', messageController.getMessages);

// Send a message
router.post('/send', messageController.sendMessage);

module.exports = router;
