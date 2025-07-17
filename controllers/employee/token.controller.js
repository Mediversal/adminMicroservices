const jwt = require('jsonwebtoken');
const redis = require('../../config/redis');

// Refresh access token
exports.refreshAccessToken = async(req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_user_${payload.user_id}`);
 
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { user_id: payload.user_id, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
