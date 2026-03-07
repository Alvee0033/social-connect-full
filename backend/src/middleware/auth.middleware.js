const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  try {
    // SECURITY: Ensure JWT_SECRET is configured to prevent authentication bypass
    if (!JWT_SECRET) {
      console.error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set.');
      return res.status(500).json({ message: 'Internal server error: Authentication misconfigured' });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId);
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
    // SECURITY: Ensure JWT_SECRET is configured
    if (!JWT_SECRET) {
      console.error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set.');
      return res.status(500).json({ message: 'Internal server error: Authentication misconfigured' });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
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
