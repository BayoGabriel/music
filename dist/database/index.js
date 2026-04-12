"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeSetCacheValue = exports.safeGetCacheValue = exports.getRedisClient = exports.disconnectFromRedis = exports.connectToRedis = exports.prisma = exports.disconnectFromMySql = exports.connectToMySql = void 0;
var prisma_1 = require("./prisma");
Object.defineProperty(exports, "connectToMySql", { enumerable: true, get: function () { return prisma_1.connectToMySql; } });
Object.defineProperty(exports, "disconnectFromMySql", { enumerable: true, get: function () { return prisma_1.disconnectFromMySql; } });
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
var redis_1 = require("./redis");
Object.defineProperty(exports, "connectToRedis", { enumerable: true, get: function () { return redis_1.connectToRedis; } });
Object.defineProperty(exports, "disconnectFromRedis", { enumerable: true, get: function () { return redis_1.disconnectFromRedis; } });
Object.defineProperty(exports, "getRedisClient", { enumerable: true, get: function () { return redis_1.getRedisClient; } });
Object.defineProperty(exports, "safeGetCacheValue", { enumerable: true, get: function () { return redis_1.safeGetCacheValue; } });
Object.defineProperty(exports, "safeSetCacheValue", { enumerable: true, get: function () { return redis_1.safeSetCacheValue; } });
//# sourceMappingURL=index.js.map