"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, message, options) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = options?.code;
        this.details = options?.details;
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map