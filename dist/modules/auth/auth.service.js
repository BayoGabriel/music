"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const app_error_1 = require("../../common/errors/app-error");
const jwt_1 = require("../../common/utils/jwt");
const password_1 = require("../../common/utils/password");
const users_service_1 = require("../users/users.service");
class AuthService {
    async register(payload) {
        const user = await users_service_1.usersService.createUser(payload);
        if (!user) {
            throw new app_error_1.AppError(500, "Unable to create user");
        }
        const token = (0, jwt_1.signAuthToken)({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        };
    }
    async login(payload) {
        const user = await users_service_1.usersService.findByEmail(payload.email);
        if (!user) {
            throw new app_error_1.AppError(401, "Invalid email or password");
        }
        const passwordMatches = await (0, password_1.comparePassword)(payload.password, user.passwordHash);
        if (!passwordMatches) {
            throw new app_error_1.AppError(401, "Invalid email or password");
        }
        const responseUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        };
        const token = (0, jwt_1.signAuthToken)({
            sub: responseUser.id,
            email: responseUser.email,
            role: responseUser.role,
        });
        return {
            token,
            user: responseUser,
        };
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map