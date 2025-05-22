const db = require('../config/db');

// find admin by email
exports.findByEmail = async (email) => {
  const [rows] = await db.execute(
    'SELECT * FROM admins WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0];
};
