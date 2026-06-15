const User = require('../models/user.model');
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const likeOp = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike;

        const users = await User.findAll({
            where: {
                display_name: { [likeOp]: `%${query}%` }
            },
            // SECURITY: Explicitly excluding 'email' from attributes to prevent PII exposure
            attributes: ['id', ['display_name', 'displayName']],
            limit: 10
        });
        res.json(users);
    } catch (error) {
        // SECURITY: Log error internally, do not leak error details to client
        console.error('Search Users Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
