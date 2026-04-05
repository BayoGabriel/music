"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const hashPassword = async (password) => bcryptjs_1.default.hash(password, env_1.env.bcryptSaltRounds);
exports.hashPassword = hashPassword;
const comparePassword = async (password, passwordHash) => {
    return bcryptjs_1.default.compare(password, passwordHash);
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=password.js.map