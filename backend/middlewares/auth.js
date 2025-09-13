const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Environment variables would be used in production
const JWT_SECRET = 'crackit-ai-secret-key';

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }
    
    // Check for Bearer prefix and remove it
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token payload'
        });
      }
      
      // Add user from payload
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      req.user = user;
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};
