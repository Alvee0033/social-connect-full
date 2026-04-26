const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// 🛡️ Sentinel: Require authentication to prevent unauthorized PII disclosure
router.get('/search', authenticateToken, userController.searchUsers);

module.exports = router;
