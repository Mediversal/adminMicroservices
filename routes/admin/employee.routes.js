const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/admin/employee.controller');
const authController = require('../../controllers/admin/auth.controller');
// Route to handle employee-related operations by admin
router.post('/', authController.authenticateToken, authController.authorizeAdmin,employeeController.createEmployee);
router.put('/:user_id',authController.authenticateToken, authController.authorizeAdmin,employeeController.updateEmployee);
router.get('/',authController.authenticateToken, authController.authorizeAdmin, employeeController.getAllEmployees);
router.delete('/:user_id',authController.authenticateToken, authController.authorizeAdmin, employeeController.deleteEmployee);
router.get('/roles', authController.authenticateToken, authController.authorizeAdmin,employeeController.getEmployeeRoles);
router.get('/permissions',authController.authenticateToken, authController.authorizeAdmin, employeeController.getEmployeePermissions);

module.exports = router;