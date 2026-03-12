const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (userData) => {
    const { display_name, email, password } = userData;

    if (!display_name || !email || !password) {
        throw new Error('Please provide display_name, email, and password');
    }

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
