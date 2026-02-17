const Post = require('../models/post.model');
const User = require('../models/user.model');

exports.createPost = async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        // User ID comes from the authenticated user, not the request body
        const userId = req.user.id;
        
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }
        
        const post = await Post.create({ content, imageUrl, userId });
        
        // Fetch the post with user info for proper response
        const postWithUser = await Post.findByPk(post.id, {
            include: [{ model: User, attributes: ['id', ['display_name', 'displayName'], 'email'] }]
        });
        
        res.status(201).json(postWithUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['id', ['display_name', 'displayName'], 'email'] }]
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.reactToPost = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify user is authenticated (middleware handles this, but good to be explicit about intent)
        if (!req.user) {
             return res.status(401).json({ message: 'Unauthorized' });
        }

        const post = await Post.findByPk(id, {
            include: [{ model: User, attributes: ['id', ['display_name', 'displayName'], 'email'] }]
        });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // In a real app, we should check if user already liked it, but for now just increment
        post.likesCount += 1;
        await post.save();
        
        // Return updated post with user info
        const updatedPost = await Post.findByPk(id, {
            include: [{ model: User, attributes: ['id', ['display_name', 'displayName'], 'email'] }]
        });
        
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
