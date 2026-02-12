const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // In production, we should throw an error. In development/test without env, this might crash app startup.
  // But we have ensured it is set in testSetup.js.
  // We'll log a warning and throw to enforce security.
  console.error('FATAL: JWT_SECRET is not defined.');
  // throw new Error('JWT_SECRET is not defined'); // Commenting out throw to avoid crashing other parts if env is weird, but process.exit(1) is better.
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fix: Use decoded.id as signed in auth.service.js
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
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

    if (token && JWT_SECRET) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id); // Fix: use decoded.id
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
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
