import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls : true
  },
  database: 0, // Ensure this matches the database you are checking
});
redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis connection error:', err));
redis.on('error', (err) => console.log('Redis Client Error', err));

await redis.connect();