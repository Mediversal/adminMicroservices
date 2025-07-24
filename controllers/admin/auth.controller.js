const bcrypt = require('bcrypt');
const jwt = require('../../utils/jwt'); // Ensure you have a JWT utility for token generation
const adminModel = require('../../models/admin');

// admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await adminModel.findByEmail(email);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.generateToken({ id: admin.id, role: 'admin' });

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.authenticateToken = (req, res, next) => {
  // Get token from Authorization header (Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer '

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No token provided' });
  }

  // Verify the token
  const user = jwt.verifyToken(token); // `jwt.verify` returns the payload or null if invalid
  if (!user) {
    return res.status(403).json({ error: 'Access Denied: Invalid token' });
  }

  // Attach the decoded user payload to the request object
  req.user = user;
  next(); // Proceed to the next middleware or route handler
};

exports.authorizeAdmin = (req, res, next) => {
  // Check if req.user exists and if the role is 'admin'
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: You do not have admin privileges' });
  }
  next(); // User is an admin, proceed
};