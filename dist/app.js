"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const admin_routes_1 = require("./modules/admin/admin.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const songs_routes_1 = require("./modules/songs/songs.routes");
const users_routes_1 = require("./modules/users/users.routes");
const withdrawal_routes_1 = require("./modules/withdrawal/withdrawal.routes");
const error_handler_middleware_1 = require("./common/middleware/error-handler.middleware");
const not_found_middleware_1 = require("./common/middleware/not-found.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    app.disable("x-powered-by");
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use((0, morgan_1.default)("combined"));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    app.use("/auth", auth_routes_1.authRouter);
    app.use("/users", users_routes_1.usersRouter);
    app.use("/songs", songs_routes_1.songsRouter);
    app.use("/withdrawal", withdrawal_routes_1.withdrawalRouter);
    app.use("/admin", admin_routes_1.adminRouter);
    app.use(not_found_middleware_1.notFoundMiddleware);
    app.use(error_handler_middleware_1.errorHandlerMiddleware);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map