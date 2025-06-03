const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

console.log('Connecting to Redis:', process.env.REDIS_HOST, process.env.REDIS_PORT);

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: process.env.REDIS_TLS === 'true' // Set REDIS_TLS=true in env if needed
  },
  database: 0,
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis connection error:', err));
redis.on('error', (err) => console.log('Redis Client Error', err));

redis.connect();

module.exports = redis;