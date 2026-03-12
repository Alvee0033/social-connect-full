const authService = require('../services/auth.service');

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error("Register error:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await authService.login(req.body);
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};
