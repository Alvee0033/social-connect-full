const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authenticateToken = async (req, res, next) => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, secret);

    // Handle both id (from auth.service) and potential legacy userId
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
       return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.display_name, // Map display_name to username for consistency if needed, or just use display_name
      display_name: user.display_name
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
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, secret);
      const userId = decoded.id || decoded.userId;

      if (userId) {
        const user = await User.findByPk(userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.display_name,
            display_name: user.display_name
          };
        }
      }
    }
    next();
  } catch (error) {
    // Token invalid or expired, continue without user
    next();
  }
};

module.exports = { authenticateToken, optionalAuth };
