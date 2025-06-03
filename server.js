const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// admin routes
app.use('/admin/auth', require('./routes/admin/auth.routes'));
app.use('/admin/employees', require('./routes/admin/employee.routes'));

// employees routes
app.use('/admin/employee/auth', require('./routes/employee/auth.routes'));
app.use('/admin/employee/token', require('./routes/employee/token.routes'));

// run application on port 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
