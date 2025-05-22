const db = require('../config/db');

// Get all users
exports.getEmployeeRoles = async () => {
  const [rows] = await db.execute('SELECT * FROM roles');
  return rows;
};

// Assign roles to user
exports.assignRoles = async (userId, roleIds = []) => {
  if (!roleIds.length) return;
  const values = roleIds.map(roleId => `(${userId}, ${roleId})`).join(',');
  await db.execute(`INSERT INTO user_roles (user_id, role_id) VALUES ${values}`);
};

// userRoleModel.js
exports.getRolesByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT r.* FROM roles r
     INNER JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [userId]
  );
  return rows;
};

// // Update roles for the user
// exports.updateRoles = async (userId, roleIds = []) => {
//   // Remove existing roles
//   await db.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);

//   // Assign new roles
//   if (roleIds.length) {
//     const values = roleIds.map(roleId => `(${userId}, ${roleId})`).join(',');
//     await db.execute(`INSERT INTO user_roles (user_id, role_id) VALUES ${values}`);
//   }
// };

// Update roles for the user
exports.updateRoles = async (userId, roleIds = []) => {
  if (!userId) {
    throw new Error('userId is required for updating roles');
  }

  // Remove existing roles
  await db.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);

  // Assign new roles only if array is not empty
  if (roleIds.length > 0) {
    const values = roleIds.map(roleId => `(${userId}, ${roleId})`).join(',');
    const sql = `INSERT INTO user_roles (user_id, role_id) VALUES ${values}`;
    await db.execute(sql);
  }
};

// Delete roles associated with the user
exports.deleteRoles = async (userId) => {
  await db.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
};
