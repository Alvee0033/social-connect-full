const Post = require('../models/post.model');
const User = require('../models/user.model');

exports.createPost = async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
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
        // SECURITY FIX: Enforce pagination to prevent DoS via unbounded query
        const page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = parseInt(req.query.limit) || 20;

        // Cap max limit to 50 to prevent massive DB loads
        limit = Math.min(50, Math.max(1, limit));

        const offset = (page - 1) * limit;

        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset,
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
        const post = await Post.findByPk(id, {
            include: [{ model: User, attributes: ['id', ['display_name', 'displayName'], 'email'] }]
        });
        if (!post) return res.status(404).json({ message: 'Post not found' });

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

