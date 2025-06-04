import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls : true
  },
  database: 0, // Ensure this matches the database you are checking
});
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis connection error:', err));
redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();
export default redisClient;