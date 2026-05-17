const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// 🛡️ Sentinel: Added authentication middleware to prevent unauthenticated PII exposure
router.get('/search', authenticateToken, userController.searchUsers);

module.exports = router;
