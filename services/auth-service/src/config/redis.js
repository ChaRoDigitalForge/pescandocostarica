import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  console.log('✅ Auth Service connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error', err);
});

// Connect to Redis
await redisClient.connect();

// Helper functions
export const setToken = async (key, value, expirationInSeconds = 604800) => {
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting token in Redis:', error);
    throw error;
  }
};

export const getToken = async (key) => {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting token from Redis:', error);
    throw error;
  }
};

export const deleteToken = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error deleting token from Redis:', error);
    throw error;
  }
};

export const blacklistToken = async (token, expirationInSeconds = 604800) => {
  try {
    await redisClient.setEx(`blacklist:${token}`, expirationInSeconds, 'true');
  } catch (error) {
    console.error('Error blacklisting token:', error);
    throw error;
  }
};

export const isTokenBlacklisted = async (token) => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    throw error;
  }
};

export default redisClient;
