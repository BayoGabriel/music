import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../config/logger";

let redisUnavailableLogged = false;

const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: () => null,
});

redis.on("error", (error) => {
  if (redisUnavailableLogged) {
    return;
  }

  redisUnavailableLogged = true;
  logger.warn("Redis connection unavailable, DB fallback will be used", {
    error: error.message,
  });
});

export const connectToRedis = async () => {
  try {
    await redis.connect();
    redisUnavailableLogged = false;
    logger.info("Redis connected");
  } catch (error) {
    if (!redisUnavailableLogged) {
      redisUnavailableLogged = true;
      logger.warn("Redis connection unavailable, DB fallback will be used", {
        error: error instanceof Error ? error.message : "Unknown Redis error",
      });
    }
  }
};

export const disconnectFromRedis = async () => {
  if (redis.status === "end") {
    return;
  }

  await redis.quit();
};

export const getRedisClient = () => redis;

export const safeGetCacheValue = async (key: string) => {
  try {
    if (redis.status !== "ready") {
      return null;
    }

    return await redis.get(key);
  } catch (error) {
    logger.warn("Redis get failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown Redis error",
    });
    return null;
  }
};

export const safeSetCacheValue = async (key: string, value: string) => {
  try {
    if (redis.status !== "ready") {
      return;
    }

    await redis.set(key, value);
  } catch (error) {
    logger.warn("Redis set failed", {
      key,
      error: error instanceof Error ? error.message : "Unknown Redis error",
    });
  }
};
