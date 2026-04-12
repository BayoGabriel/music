"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const roles_1 = require("../../common/constants/roles");
const app_error_1 = require("../../common/errors/app-error");
const password_1 = require("../../common/utils/password");
const env_1 = require("../../config/env");
const database_1 = require("../../database");
const toStoredRole = (role) => role;
const toUserResponse = (user) => {
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        email: user.email,
        role: toStoredRole(user.role),
        createdAt: user.createdAt,
    };
};
class UsersService {
    async findByEmail(email) {
        return database_1.prisma.user.findUnique({ where: { email } });
    }
    async findById(userId) {
        return database_1.prisma.user.findUnique({ where: { id: userId } });
    }
    async createUser(payload) {
        const existingUser = await this.findByEmail(payload.email);
        if (existingUser) {
            throw new app_error_1.AppError(409, "Email is already registered");
        }
        const passwordHash = await (0, password_1.hashPassword)(payload.password);
        const user = await database_1.prisma.user.create({
            data: {
                email: payload.email,
                passwordHash,
                role: toStoredRole(payload.role ?? roles_1.Role.USER),
            },
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
                await database_1.prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        role: roles_1.Role.ADMIN,
                        passwordHash: await (0, password_1.hashPassword)(env_1.env.adminPassword),
                    },
                });
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