"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectFromMongo = exports.connectToMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
mongoose_1.default.set('strictQuery', true);
const connectToMongo = async () => {
    await mongoose_1.default.connect(env_1.env.mongodbUri);
    logger_1.logger.info('MongoDB connected');
};
exports.connectToMongo = connectToMongo;
const disconnectFromMongo = async () => {
    await mongoose_1.default.disconnect();
    logger_1.logger.info('MongoDB disconnected');
};
exports.disconnectFromMongo = disconnectFromMongo;
//# sourceMappingURL=mongo.js.map