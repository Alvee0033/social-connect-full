const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // We throw an error to fail fast if configuration is missing.
  // Ideally, this should be checked at startup, but checking here ensures safety.
  // For tests without .env, we might need to handle this, but let's enforce it.
  console.warn('WARNING: JWT_SECRET is not defined!');
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fixed: payload has 'id', not 'userId'
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      // Fixed: User model has display_name, not username
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

    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id); // Fixed userId -> id
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          displayName: user.display_name, // Fixed username -> display_name
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
