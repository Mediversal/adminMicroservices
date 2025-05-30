const bcrypt = require("bcrypt");
const userModel = require("../../models/userModel");
const userRoleModel = require("../../models/userRoleModel");
const userPermissionModel = require("../../models/userPermissionModel");
const sendSMS = require("../../utils/sendSMS");
db = require("../../config/db");
const {sendUpdatedLoginCredentials,sendLoginCredentials} = require("../../utils/sendEmail");

//create employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, password, employee_id, role_ids, permission_ids } = req.body;

    // Check duplicates
    const existing = await userModel.findByEmailOrPhone(email, phone);
    if (existing)
      return res.status(400).json({ error: "Email or phone already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await userModel.create({
      name,
      email,
      phone,
      employee_id,
      password_hash: hashedPassword,
    });

    await userRoleModel.assignRoles(userId, role_ids);
    // await userPermissionModel.assignPermissions(userId, permission_ids);
    await userPermissionModel.assignPermissions(userId, permission_ids);

    // Send credentials
    if (email) {
      await sendLoginCredentials({ to: email, email, name, phone, password });
    }

    if (phone) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendSMS(phone, otp);
    }

    res
      .status(201)
      .json({ message: "User created successfully and credentials sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    // Fetch all users
    const users = await userModel.getAll();

    // Fetch roles and permissions for each user
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const roles = await userRoleModel.getRolesByUserId(user.id);
        const permissions = await userPermissionModel.getPermissionsByUserId(
          user.id
        );

        return {
          ...user,
          roles,
          permissions,
        };
      })
    );

    res.status(200).json(userDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email, phone, password, employee_id, roleIds, permissionIds } = req.body;

    let password_hash;
    const changes = [];

    if (password) {
      const bcrypt = require("bcrypt");
      password_hash = await bcrypt.hash(password, 10);
      changes.push("Password");
    }

    const user = await userModel.getById(user_id); // you must have this method

    const updateData = {};
    if (name && name !== user.name) {
      updateData.name = name;
      changes.push("Name");
    }
    if (email && email !== user.email) {
      updateData.email = email;
      changes.push("Email");
    }
    if (phone && phone !== user.phone) {
      updateData.phone = phone;
      changes.push("Phone");
    }
    if (employee_id && employee_id !== user.employee_id) {
      updateData.employee_id = employee_id;
      changes.push("Employee ID");
    }
    if (password) {
      updateData.password_hash = password_hash;
    }

    // 1. Update user
    if (Object.keys(updateData).length > 0) {
      await userModel.update({ user_id, ...updateData });
    }

    // 2. Update roles
    if (Array.isArray(roleIds)) {
      await userRoleModel.updateRoles(user_id, roleIds);
      changes.push("Roles");
    }

    // 3. Update permissions
    if (Array.isArray(permissionIds)) {
      await userPermissionModel.updatePermissions(user_id, permissionIds);
      changes.push("Permissions");
    }

    // 4. Send email if anything updated
    if (changes.length > 0) {
      await sendUpdatedLoginCredentials({
        to: email || user.email,
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
        password: password || "Unchanged",
        updatedFields: changes,
      });
    }

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check if user exists
    const existingUser = await userModel.getById(user_id);
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    // Pass array of role IDs
    await userPermissionModel.deleteUserPermissions(user_id);

    // 2. Delete roles associated with the user
    await userRoleModel.deleteRoles(user_id);

    // 4. Delete the user
    await userModel.delete(user_id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//get employee roles
exports.getEmployeeRoles = async (req, res) => {
  try {
    // Fetch all users
    const roles = await userRoleModel.getEmployeeRoles();
    res.status(200).json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//get employee permissions
exports.getEmployeePermissions = async (req, res) => {
  try {
    // Fetch all users
    const roles = await userPermissionModel.getEmployeePermissions();
    res.status(200).json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
