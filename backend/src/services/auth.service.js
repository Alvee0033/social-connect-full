const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (userData) => {
    const { display_name, email, password } = userData;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        throw new Error('User already exists');
    }

    const user = await User.create({
        display_name,
        email,
        password,
    });

    return {
        id: user.id.toString(),
        displayName: user.display_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        token: generateToken(user.id),
    };
};

exports.login = async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
        return {
            id: user.id.toString(),
            displayName: user.display_name,
            email: user.email,
            avatarUrl: user.avatar_url,
            token: generateToken(user.id),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};
