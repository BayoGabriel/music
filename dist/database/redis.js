"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeSetCacheValue = exports.safeGetCacheValue = exports.getRedisClient = exports.disconnectFromRedis = exports.connectToRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
let redisUnavailableLogged = false;
const redis = new ioredis_1.default(env_1.env.redisUrl, {
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
    logger_1.logger.warn("Redis connection unavailable, DB fallback will be used", {
        error: error.message,
    });
});
const connectToRedis = async () => {
    try {
        await redis.connect();
        redisUnavailableLogged = false;
        logger_1.logger.info("Redis connected");
    }
    catch (error) {
        if (!redisUnavailableLogged) {
            redisUnavailableLogged = true;
            logger_1.logger.warn("Redis connection unavailable, DB fallback will be used", {
                error: error instanceof Error ? error.message : "Unknown Redis error",
            });
        }
    }
};
exports.connectToRedis = connectToRedis;
const disconnectFromRedis = async () => {
    if (redis.status === "end") {
        return;
    }
    await redis.quit();
};
exports.disconnectFromRedis = disconnectFromRedis;
const getRedisClient = () => redis;
exports.getRedisClient = getRedisClient;
const safeGetCacheValue = async (key) => {
    try {
        if (redis.status !== "ready") {
            return null;
        }
        return await redis.get(key);
    }
    catch (error) {
        logger_1.logger.warn("Redis get failed", {
            key,
            error: error instanceof Error ? error.message : "Unknown Redis error",
        });
        return null;
    }
};
exports.safeGetCacheValue = safeGetCacheValue;
const safeSetCacheValue = async (key, value) => {
    try {
        if (redis.status !== "ready") {
            return;
        }
        await redis.set(key, value);
    }
    catch (error) {
        logger_1.logger.warn("Redis set failed", {
            key,
            error: error instanceof Error ? error.message : "Unknown Redis error",
        });
    }
};
exports.safeSetCacheValue = safeSetCacheValue;
//# sourceMappingURL=redis.js.map