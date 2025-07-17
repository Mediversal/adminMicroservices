const db = require('../config/db'); // Assuming you have a db module to handle database connections

exports.log = async (userId, eventType, ip, userAgent)=> {
  await db.query(
    `INSERT INTO audit_logs (user_id, event_type, ip_address, user_agent) VALUES (?, ?, ?, ?)`,
    [userId, eventType, ip || 'unknown', userAgent || 'unknown']
  );
}
