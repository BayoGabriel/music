"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const roles_1 = require("../../common/constants/roles");
const app_error_1 = require("../../common/errors/app-error");
const password_1 = require("../../common/utils/password");
const env_1 = require("../../config/env");
const user_model_1 = require("./user.model");
const toUserResponse = (user) => {
    if (!user) {
        return null;
    }
    return {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
};
class UsersService {
    async findByEmail(email) {
        return user_model_1.UserModel.findOne({ email }).exec();
    }
    async findById(userId) {
        return user_model_1.UserModel.findById(userId).exec();
    }
    async createUser(payload) {
        const existingUser = await this.findByEmail(payload.email);
        if (existingUser) {
            throw new app_error_1.AppError(409, "Email is already registered");
        }
        const passwordHash = await (0, password_1.hashPassword)(payload.password);
        const user = await user_model_1.UserModel.create({
            email: payload.email,
            passwordHash,
            role: payload.role ?? roles_1.Role.USER,
        });
        return toUserResponse(user);
    }
    async getProfile(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new app_error_1.AppError(404, "User not found");
        }
        return toUserResponse(user);
    }
    async ensureAdminAccount() {
        if (!env_1.env.adminEmail || !env_1.env.adminPassword) {
            return;
        }
        const existingUser = await this.findByEmail(env_1.env.adminEmail);
        if (existingUser) {
            if (existingUser.role !== roles_1.Role.ADMIN) {
                existingUser.role = roles_1.Role.ADMIN;
                existingUser.passwordHash = await (0, password_1.hashPassword)(env_1.env.adminPassword);
                await existingUser.save();
            }
            return;
        }
        await this.createUser({
            email: env_1.env.adminEmail,
            password: env_1.env.adminPassword,
            role: roles_1.Role.ADMIN,
        });
    }
}
exports.usersService = new UsersService();
//# sourceMappingURL=users.service.js.map