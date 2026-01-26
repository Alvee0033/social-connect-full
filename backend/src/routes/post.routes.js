const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.post('/:id/react', postController.reactToPost);

module.exports = router;
