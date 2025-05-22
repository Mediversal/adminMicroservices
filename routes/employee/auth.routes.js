const express = require('express');
const router = express.Router();

const employeeAuthController = require('../../controllers/employee/auth.controller');

// Route to handle employee login
router.post('/login/email', employeeAuthController.loginWithEmail);
router.post('/login/otp', employeeAuthController.loginWithOtp);  
router.post('/login/otp', employeeAuthController.loginWithOtp); 
router.post('/verify-otp', employeeAuthController.verifyOTP);  
router.post('/request-password-reset', employeeAuthController.requestPasswordReset);

module.exports = router;
