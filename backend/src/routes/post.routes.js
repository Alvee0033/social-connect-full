const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// 🛡️ Sentinel: Enforce Authentication
// Protected sensitive POST endpoints to prevent unauthorized actions and IDOR.
router.post('/', authenticateToken, postController.createPost);
router.get('/', optionalAuth, postController.getPosts);
router.post('/:id/react', authenticateToken, postController.reactToPost);

module.exports = router;
