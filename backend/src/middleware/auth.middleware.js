const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined!');
      return res.status(500).json({ message: 'Internal server error' });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fixed: decoded.id instead of decoded.userId to match token generation
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      // User model has display_name, not username?
      // Checking auth.service.js: it returns displayName: user.display_name.
      // Middleware was setting username: user.username.
      // Checking user.model.js: it has display_name, no username.
      // So user.username was probably undefined before too.
      // I'll fix this to display_name as well for consistency, or keep it safe.
      // But req.user is used by controllers.
      // Let's check where req.user is used.
      // user.controller.js, post.controller.js don't seem to rely on username/display_name from req.user (post controller takes userId from body - which is bad but irrelevant here).
      // I will map display_name to username just in case, or fix it to displayName.
      username: user.display_name,
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
  try {
    if (!JWT_SECRET) {
        // If no secret, we can't verify, so treated as no auth
        return next();
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id); // Fixed: decoded.id
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          username: user.display_name,
          display_name: user.display_name
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
