"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeSetCacheValue = exports.safeGetCacheValue = exports.getRedisClient = exports.disconnectFromRedis = exports.connectToRedis = exports.disconnectFromMongo = exports.connectToMongo = void 0;
var mongo_1 = require("./mongo");
Object.defineProperty(exports, "connectToMongo", { enumerable: true, get: function () { return mongo_1.connectToMongo; } });
Object.defineProperty(exports, "disconnectFromMongo", { enumerable: true, get: function () { return mongo_1.disconnectFromMongo; } });
var redis_1 = require("./redis");
Object.defineProperty(exports, "connectToRedis", { enumerable: true, get: function () { return redis_1.connectToRedis; } });
Object.defineProperty(exports, "disconnectFromRedis", { enumerable: true, get: function () { return redis_1.disconnectFromRedis; } });
Object.defineProperty(exports, "getRedisClient", { enumerable: true, get: function () { return redis_1.getRedisClient; } });
Object.defineProperty(exports, "safeGetCacheValue", { enumerable: true, get: function () { return redis_1.safeGetCacheValue; } });
Object.defineProperty(exports, "safeSetCacheValue", { enumerable: true, get: function () { return redis_1.safeSetCacheValue; } });
//# sourceMappingURL=index.js.map