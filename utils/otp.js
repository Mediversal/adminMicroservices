const redis = require('../config/redis');
const userModel = require('../models/userModel');
const { sendSMS } = require('./sms');

exports.sendOtpToPhone = async (phone) => {
  const phoneKey = `otp_${phone}`;
  const rateKeyMin = `otp_rate_min_${phone}`;
  const rateKeyHour = `otp_rate_hour_${phone}`;

  const user = await userModel.getByPhone(phone);
  if (!user) throw new Error('User not found');

  const minCount = await redis.incr(rateKeyMin);
  const hourCount = await redis.incr(rateKeyHour);

  if (minCount === 1) await redis.expire(rateKeyMin, 60);
  if (hourCount === 1) await redis.expire(rateKeyHour, 3600);

  if (minCount > 3 || hourCount > 10) {
    throw new Error('Rate limit exceeded. Try again later.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.setex(phoneKey, 300, otp); // 5 minutes
  await redis.del(`otp_fail_${phone}`);
  await sendSMS(phone, otp);
};
