const User = require('../models/user.model');
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const searchOp = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike;
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [searchOp]: `%${query}%` } },
                    { email: { [searchOp]: `%${query}%` } }
                ]
            },
            attributes: ['id', ['display_name', 'displayName']],
            limit: 10
        });
        res.json(users);
    } catch (error) {
        console.error('Error in searchUsers:', error);
        res.status(500).json({ message: 'An internal server error occurred while searching for users' });
    }
};
