const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// SECURITY: Require authentication to prevent unauthenticated PII enumeration
router.get('/search', authenticateToken, userController.searchUsers);

module.exports = router;
