const bcrypt = require("bcrypt");
const redis = require("../../config/redis");
const userModel = require("../../models/userModel");
const userRoleModel = require("../../models/userRoleModel");
const userPermissionModel = require("../../models/userPermissionModel");
const sendSMS = require("../../utils/sendSMS");
// const refreshTokenModel = require('../models/refreshTokenModel');
// const auditLogModel = require("../../models/auditLogModel");
const { getClientIP, getUserAgent } = require("../../utils/requestUtils");
const { generateTokens } = require("../../utils/generateTokens");
const {sendPasswordResetRequestToAdmin} = require("../../utils/sendEmail");
const db = require("../../config/db");

// Helper function to get user roles and permissions
const getUserRolesAndPermissions = async (userId) => {
  const roles = await userRoleModel.getRolesByUserId(userId);
  const permissions = await userPermissionModel.getPermissionsByUserId(userId);
  return {
    roles: roles,
    permissions: permissions,
  };
};

// Login with Email and Password
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIP(req);
    const userAgent = getUserAgent(req);
    const user = await userModel.getByEmail(email);

    if (!user || !user.is_active) {
      // await auditLogModel.log(null, 'LOGIN_FAILED', ip, userAgent);
      return res.status(401).json({ error: "Invalid login or password" });
    }

    // Check if locked
    if (user.is_locked && new Date(user.lock_expires_at) > new Date()) {
      return res
        .status(403)
        .json({ error: "Account locked. Try again later." });
    }

   // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment failed attempts
      await userModel.incrementFailedAttempts(user.id);

      // Lock if 3 attempts
      if (user.failed_attempts + 1 >= 3) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await userModel.lockAccount(user.id, lockUntil);
      }

      // await auditLogModel.log(user.id, 'LOGIN_FAILED', ip, userAgent);
      return res.status(401).json({ error: "Invalid login or password" });
    }

    // Reset failed attempts
    await userModel.resetFailedAttempts(user.id);

    // Roles & permissions
    const { roles, permissions } = await getUserRolesAndPermissions(user.id);

    // generateTokens and store in Redis
    const { accessToken, refreshToken } = await generateTokens(user);

    // Save refresh token in DB
    // await refreshTokenModel.save(user.id, refreshToken);

    // Audit log
    // await auditLogModel.log(user.id, 'LOGIN_PASSWORD', ip, userAgent);

    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        employee_id: user.employee_id,
        roles,
        permissions,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Login with OTP
exports.loginWithOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const phoneKey = `otp_${phone}`;
    const rateKeyMin = `otp_rate_min_${phone}`;
    const rateKeyHour = `otp_rate_hour_${phone}`;

    const user = await userModel.getByPhone(phone);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Rate limit checks
    const minCount = await redis.incr(rateKeyMin);
    const hourCount = await redis.incr(rateKeyHour);

    if (minCount === 1) await redis.expire(rateKeyMin, 60); // 1 min
    if (hourCount === 1) await redis.expire(rateKeyHour, 3600); // 1 hour

    if (minCount > 3 || hourCount > 10) {
      return res
        .status(429)
        .json({ error: "Rate limit exceeded. Try again later." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis (5 min) and reset failed attempts
    await redis.setex(phoneKey, 300, otp);
    await redis.del(`otp_fail_${phone}`); // reset failures if any

    // send smg to user
    await sendSMS(phone, otp);

    res.status(200).json({ message: "OTP sent to your phone" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const phoneKey = `otp_${phone}`;
    const lockKey = `otp_lock_${phone}`;
    const failKey = `otp_fail_${phone}`;

    const isLocked = await redis.get(lockKey);
    if (isLocked) {
      return res
        .status(403)
        .json({ error: "Too many failed attempts. Try again later." });
    }

    const storedOtp = await redis.get(phoneKey);
    if (!storedOtp) {
      return res.status(400).json({ error: "OTP expired or invalid" });
    }

    if (otp !== storedOtp) {
      // Increase failed attempts
      const fails = await redis.incr(failKey);
      if (fails === 1) await redis.expire(failKey, 300); // 5 min

      if (fails >= 3) {
        await redis.setex(lockKey, 900, "locked"); // 15 min lock
        return res
          .status(403)
          .json({ error: "Too many failed attempts. Locked for 15 minutes" });
      }

      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP verified successfully
    const user = await userModel.getByPhone(phone);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { roles, permissions } = await getUserRolesAndPermissions(user.id);

    // Tokens
    // const { accessToken, refreshToken } = generateTokens(user);
    const { accessToken, refreshToken } = await generateTokens(user);

    // Save refresh token in DB
    // await refreshTokenModel.save(user.id, refreshToken);

    // Clean up
    await redis.del(phoneKey);
    await redis.del(failKey);

    // await logAuditEvent(user.id, 'LOGIN_OTP');

    res.status(200).json({
      message: "Login successful",

      user: {
        user_id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        employee_id: user.employee_id,
        roles,
        permissions,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//requestPasswordReset
exports.requestPasswordReset = async (req, res) => {
  const { email ,phone} = req.body;
   if (!email && !phone) {
    return res.status(400).json({ message: 'Email or phone number is required' });
  }
  
  try {
   
    const [rows] = await db.query('SELECT id, name, email, phone FROM users WHERE email = ? OR phone = ? ', [email,phone]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    // Notify admin (example email)
    const adminEmail = "no-reply@mediversal.in"
    await sendPasswordResetRequestToAdmin({ to:adminEmail,email: rows[0].email, userId: rows[0].id, name: rows[0].name, phone:rows[0].phone });
    res.json({ message: 'Password reset request sent to admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};