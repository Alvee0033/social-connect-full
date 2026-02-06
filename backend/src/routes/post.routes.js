const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Protect all post routes
router.use(authenticateToken);

router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.post('/:id/react', postController.reactToPost);

module.exports = router;
