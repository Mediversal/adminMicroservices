
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

// Function to generate access and refresh tokens
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { user_id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { user_id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '24h' }
  );

 // Store in Redis with expiry of 24h
  // await redis.set(`refresh_user_${user.id}`, 86400, refreshToken);
  
  await redis.set(`refresh_user_${user.id}`, refreshToken, {
  EX: 86400, // 24 hours in seconds
});
 
  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
