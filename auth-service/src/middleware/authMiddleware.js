const authService = require('../services/authService');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = authMiddleware;
