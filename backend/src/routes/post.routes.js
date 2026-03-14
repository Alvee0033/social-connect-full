const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, postController.createPost); // SECURITY: Require authentication to create posts
router.get('/', postController.getPosts);
router.post('/:id/react', authenticateToken, postController.reactToPost); // SECURITY: Require authentication to react

module.exports = router;
