const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protect routes that modify data
router.post('/', authenticateToken, postController.createPost);
router.get('/', postController.getPosts); // Public feed
router.post('/:id/react', authenticateToken, postController.reactToPost);

module.exports = router;
