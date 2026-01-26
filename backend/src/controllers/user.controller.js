const User = require('../models/user.model');
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } }
                ]
            },
            attributes: ['id', ['display_name', 'displayName'], 'email'],
            limit: 10
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
