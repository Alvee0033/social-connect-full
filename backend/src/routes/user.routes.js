const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protect the search endpoint to prevent PII leakage to unauthenticated users
router.get('/search', authenticateToken, userController.searchUsers);

module.exports = router;
