"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const jwt_1 = require("../utils/jwt");
const app_error_1 = require("../errors/app-error");
const authGuard = (req, _res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader?.startsWith('Bearer ')) {
        next(new app_error_1.AppError(401, 'Authorization token is required'));
        return;
    }
    const token = authorizationHeader.slice('Bearer '.length).trim();
    try {
        const payload = (0, jwt_1.verifyAuthToken)(token);
        req.authUser = {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        };
        next();
    }
    catch (_error) {
        next(new app_error_1.AppError(401, 'Invalid or expired token'));
    }
};
exports.authGuard = authGuard;
//# sourceMappingURL=auth.guard.js.map