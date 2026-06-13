const User = require('../models/user.model');
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // SQLite doesn't support iLike, use like in tests
        const likeOp = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike;

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [likeOp]: `%${query}%` } },
                    { email: { [likeOp]: `%${query}%` } }
                ]
            },
            // Security: Remove 'email' to prevent PII exposure
            attributes: ['id', ['display_name', 'displayName']],
            limit: 10
        });
        res.json(users);
    } catch (error) {
        // Security: Don't leak stack traces
        console.error('searchUsers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
