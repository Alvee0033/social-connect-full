const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// SECURITY: Ensure authenticated users only can create posts
router.post('/', authenticateToken, postController.createPost);

// SECURITY: Allow public read but optional auth for user context
router.get('/', optionalAuth, postController.getPosts);

// SECURITY: Ensure authenticated users only can react to posts
router.post('/:id/react', authenticateToken, postController.reactToPost);

module.exports = router;
