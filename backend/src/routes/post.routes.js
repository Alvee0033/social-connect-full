const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, postController.createPost);
router.get('/', postController.getPosts);
router.post('/:id/react', authenticateToken, postController.reactToPost);

module.exports = router;
