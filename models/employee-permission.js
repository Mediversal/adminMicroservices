const db = require('../config/db');

// Get all users
exports.getEmployeePermissions = async () => {
  const [rows] = await db.execute('SELECT * FROM permissions');
  return rows;
};

//assign permissions to user
exports.assignPermissions = async (employee_id=user_id, permission_ids) => {
  if (!Array.isArray(permission_ids) || permission_ids.length === 0) return;

  const values = permission_ids.map(pid => [employee_id, pid]);
  await db.query(`INSERT INTO employee_permissions (employee_id, permission_id) VALUES ?`, [values]);
};

// get permissions by user id
exports.getPermissionsByUserId = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT p.*
FROM permissions p
INNER JOIN employee_permissions ep ON ep.permission_id = p.id
WHERE ep.employee_id = ?
`,
    [user_id]);
  return rows
};

//update permissions by user id
exports.updatePermissions = async (user_id, permission_ids) => {
  await db.query(`DELETE FROM employee_permissions WHERE employee_id = ?`, [user_id]);
  return this.assignPermissions(user_id, permission_ids);
};

//delete permissions by user id
exports.deleteUserPermissions = async (user_id) => {
  await db.query(`DELETE FROM employee_permissions WHERE employee_id = ?`, [user_id]);
};
