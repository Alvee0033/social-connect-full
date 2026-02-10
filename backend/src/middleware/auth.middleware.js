const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// 🛡️ Sentinel: Enforce presence of JWT_SECRET.
// Hardcoded secrets are a critical vulnerability.
if (!process.env.JWT_SECRET) {
  // In production, this should prevent startup.
  // In tests, ensure process.env.JWT_SECRET is set in testSetup.js
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 🛡️ Sentinel: Fixed logic bug. Token is signed with `id`, not `userId`.
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Optional authentication - doesn't fail if no token, but attaches user if present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      // 🛡️ Sentinel: Fixed logic bug. Token is signed with `id`.
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      }
    }
    next();
  } catch (error) {
    // Token invalid or expired, continue without user
    next();
  }
};

module.exports = { authenticateToken, optionalAuth };
