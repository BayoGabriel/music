"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_1 = require("./users.service");
class UsersController {
    async getMe(req, res) {
        const userId = req.authUser?.id;
        const profile = await users_service_1.usersService.getProfile(userId);
        res.status(200).json({ data: profile });
    }
}
exports.usersController = new UsersController();
//# sourceMappingURL=users.controller.js.map