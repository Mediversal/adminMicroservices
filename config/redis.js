const Redis = require('ioredis');
require('dotenv').config();
 
const redis = new Redis({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  database: 0,
});
 
redis.on('connect', () => {
  console.log('✅ Redis Connected Successfully');
});
 
redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});
 
module.exports = redis;