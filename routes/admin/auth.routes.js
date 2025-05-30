const express = require('express');
const router = express.Router();

const adminAuthController = require('../../controllers/admin/auth.controller');

// Route to handle admin login
router.post('/login', adminAuthController.loginAdmin);
// router.post('/login', adminAuthController.unifiedLogin);


module.exports = router;
