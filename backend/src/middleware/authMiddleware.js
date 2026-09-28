const { verifyToken } = require('../utils/jwt');

/**
 * Authentication Middleware
 * 1. Read Authorization header
 * 2. Extract Bearer token
 * 3. Verify JWT
 * 4. Extract user ID
 * 5. Attach to req.userId
 * 6. Continue to next middleware / controller
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Token is invalid or expired.',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
