const User = require('../models/user.model');
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // SECURITY: Conditionally use Op.like for test environment compatibility
        // as SQLite does not support Op.iLike out of the box.
        const likeOp = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike;

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [likeOp]: `%${query}%` } },
                    { email: { [likeOp]: `%${query}%` } }
                ]
            },
            // SECURITY: Removed 'email' to prevent PII exposure
            attributes: ['id', ['display_name', 'displayName']],
            limit: 10
        });
        res.json(users);
    } catch (error) {
        // SECURITY: Return generic error message to avoid leaking stack traces or internals
        res.status(500).json({ message: 'Internal server error while searching users.' });
    }
};
