const User = require('../models/user.model');
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // SQLite in test env doesn't support iLike, so we conditionally use like or iLike
        const likeOp = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike;

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [likeOp]: `%${query}%` } },
                    { email: { [likeOp]: `%${query}%` } }
                ]
            },
            attributes: ['id', ['display_name', 'displayName'], 'email'],
            limit: 10
        });
        res.json(users);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: error.message });
    }
};
