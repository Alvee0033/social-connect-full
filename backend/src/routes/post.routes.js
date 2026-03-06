const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Apply authentication middleware
router.post('/', authenticateToken, postController.createPost);
router.get('/', optionalAuth, postController.getPosts);
router.post('/:id/react', authenticateToken, postController.reactToPost);

module.exports = router;
