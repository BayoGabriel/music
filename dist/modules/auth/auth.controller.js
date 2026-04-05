"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    async register(req, res) {
        const result = await auth_service_1.authService.register(req.body);
        res.status(201).json({ data: result });
    }
    async login(req, res) {
        const result = await auth_service_1.authService.login(req.body);
        res.status(200).json({ data: result });
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map