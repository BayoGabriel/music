"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const app_error_1 = require("../errors/app-error");
const errorHandlerMiddleware = (error, _req, res, _next) => {
    const statusCode = error instanceof app_error_1.AppError
        ? error.statusCode
        : error instanceof zod_1.ZodError || error instanceof multer_1.default.MulterError
            ? 400
            : res.statusCode >= 400
                ? res.statusCode
                : 500;
    res.status(statusCode).json({
        message: error.message || "Internal server error",
        ...(error instanceof app_error_1.AppError && error.code ? { code: error.code } : {}),
        ...(error instanceof app_error_1.AppError && error.details
            ? { details: error.details }
            : {}),
    });
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
//# sourceMappingURL=error-handler.middleware.js.map