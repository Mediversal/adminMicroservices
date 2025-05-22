const db = require('../config/db'); // Assuming you have a db module to handle database connections

exports.save = async(userId, token)=> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs
  await db.query(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`, [userId, token, expiresAt]);
}

exports.deleteTokens = async(userId)=> {
  await db.query(`DELETE FROM refresh_tokens WHERE user_id = ?`, [userId]);
}
