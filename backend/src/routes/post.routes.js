const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protect post creation
router.post('/', authenticateToken, postController.createPost);

// Get posts remains public (or use optionalAuth if you want to customize for user)
router.get('/', postController.getPosts);

// Protect reactions
router.post('/:id/react', authenticateToken, postController.reactToPost);

module.exports = router;
