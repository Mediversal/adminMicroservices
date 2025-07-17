
const express = require('express');
const router = express.Router();
const tokenController = require('../../controllers/employee/token.controller');

// Route to handle token refresh
router.post('/refresh', tokenController.refreshAccessToken); 

module.exports = router;
