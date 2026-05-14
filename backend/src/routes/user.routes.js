const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to protect user PII
router.get('/search', authenticateToken, userController.searchUsers);

module.exports = router;
