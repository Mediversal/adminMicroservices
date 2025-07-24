const db = require('../config/db');

//find employees by email or phone
exports.findByEmailOrPhone = async (email, phone) => {
  const [rows] = await db.execute(
    'SELECT * FROM employees WHERE email = ? OR phone = ? LIMIT 1',
    [email, phone]
  );
  return rows[0];
};

// Create a new employees
exports.create = async ({ name, email, phone, employeeId_no, password_hash }) => {
  const [result] = await db.execute(
    'INSERT INTO employees (name, email, phone, employeeId_no, password_hash) VALUES (?, ?, ?, ?,?)',
    [name, email, phone, employeeId_no, password_hash]
  );
  return result.insertId;
};

// Get all employees
exports.getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM employees');
  return rows;
};

// Get employees by ID
exports.getById = async (userId) => {
  const [rows] = await db.execute('SELECT * FROM employees WHERE id = ? LIMIT 1', [userId]);
  return rows[0];
};

// Get user by email
exports.getByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM employees WHERE email = ?', [email]);
  return rows[0]; // return single user or undefined
};

// Get user by email
exports.getByPhone = async (phone) => {
  const [rows] = await db.execute('SELECT * FROM employees WHERE phone = ?', [phone]);
  return rows[0]; // return single user or undefined
};

//update user by ID
exports.update = async (user) => {
  const { user_id, name, email, phone, employee_id, password_hash } = user;

   const employeeId_no = employee_id
  if (!user_id) {
    throw new Error('user_id is required');
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push('phone = ?');
    values.push(phone);
  }
  if (employeeId_no !== undefined) {
    fields.push('employeeId_no = ?');
    values.push(employeeId_no);
  }
  if (password_hash !== undefined) {
    fields.push('password_hash = ?');
    values.push(password_hash);
  }

  if (fields.length === 0) {
    // No update needed
    return;
  }

  const sql = `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`;
  values.push(user_id);

  await db.execute(sql, values);
};

// Delete user by ID
exports.delete = async (userId) => {
  await db.execute('DELETE FROM employees WHERE id = ?', [userId]);
};

// increment failed attempts
exports.incrementFailedAttempts= async(userId)=>  {
  await db.query(`UPDATE employees SET failed_attempts = failed_attempts + 1 WHERE id = ?`, [userId]);
}

// check if user is locked
exports.lockAccount= async(userId, lockUntil)=> {
  await db.query(`UPDATE employees SET is_locked = TRUE, lock_expires_at = ? WHERE id = ?`, [lockUntil, userId]);
}

//reset failed attempts
exports.resetFailedAttempts = async(userId) => {
  await db.query(`UPDATE employees SET failed_attempts = 0, is_locked = FALSE, lock_expires_at = NULL WHERE id = ?`, [userId]);
}
