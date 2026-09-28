const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teenspend_default_dev_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a JWT containing user ID
 * @param {string} userId - User ID UUID
 * @returns {string} Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT and extract decoded payload
 * @param {string} token - Bearer JWT
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
