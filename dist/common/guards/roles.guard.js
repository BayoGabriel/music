"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesGuard = void 0;
const app_error_1 = require("../errors/app-error");
const rolesGuard = (allowedRoles) => {
    return (req, _res, next) => {
        if (!req.authUser) {
            next(new app_error_1.AppError(401, "Authentication required"));
            return;
        }
        if (!allowedRoles.includes(req.authUser.role)) {
            next(new app_error_1.AppError(403, "Insufficient permissions"));
            return;
        }
        next();
    };
};
exports.rolesGuard = rolesGuard;
//# sourceMappingURL=roles.guard.js.map