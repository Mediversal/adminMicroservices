const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/admin/employee.controller');

// Route to handle employee-related operations by admin
router.post('/', employeeController.createEmployee);
router.put('/:user_id',employeeController.updateEmployee);
router.get('/', employeeController.getAllEmployees);
router.delete('/:user_id', employeeController.deleteEmployee);
router.get('/roles', employeeController.getEmployeeRoles);
router.get('/permissions', employeeController.getEmployeePermissions);

module.exports = router;