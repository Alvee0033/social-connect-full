const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// SECURITY: Enforce authentication on user search endpoint to prevent unauthorized data access
router.get('/search', authenticateToken, userController.searchUsers);

module.exports = router;
