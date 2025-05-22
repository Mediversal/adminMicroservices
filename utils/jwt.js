// utils/jwt.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use .env in production

exports.generateToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
