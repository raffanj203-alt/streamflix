import { Redis } from '@upstash/redis'

const FALLBACK_STORE = {
  videos: [],
  ads_scripts: { popunder: '', socialbar: '' },
}

const redisConfig = {
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
}

export const redis = new Redis(redisConfig)

export async function getRedisValue(key, fallback) {
  if (!redisConfig.url || !redisConfig.token) {
    return FALLBACK_STORE[key] ?? fallback
  }

  try {
    const value = await redis.get(key)
    return value ?? fallback
  } catch (error) {
    console.warn(`Redis get failed for key "${key}":`, error.message || error)
    return FALLBACK_STORE[key] ?? fallback
  }
}

export async function setRedisValue(key, value) {
  if (!redisConfig.url || !redisConfig.token) {
    FALLBACK_STORE[key] = value
    return true
  }

  try {
    await redis.set(key, value)
    FALLBACK_STORE[key] = value
    return true
  } catch (error) {
    console.warn(`Redis set failed for key "${key}":`, error.message || error)
    FALLBACK_STORE[key] = value
    return false
  }
}