"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./database");
const platform_service_1 = require("./modules/platform/platform.service");
const users_service_1 = require("./modules/users/users.service");
const startServer = async () => {
    await (0, database_1.connectToMongo)();
    await (0, database_1.connectToRedis)();
    await platform_service_1.platformService.ensureSettingsDocument();
    await platform_service_1.platformService.warmMusicEnabledCache();
    await users_service_1.usersService.ensureAdminAccount();
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.port, () => {
        logger_1.logger.info("Server started", { port: env_1.env.port, environment: env_1.env.nodeEnv });
    });
    const shutdown = async (signal) => {
        logger_1.logger.info("Shutdown signal received", { signal });
        server.close(async () => {
            await Promise.allSettled([(0, database_1.disconnectFromRedis)(), (0, database_1.disconnectFromMongo)()]);
            process.exit(0);
        });
        setTimeout(() => {
            process.exit(1);
        }, 10000).unref();
    };
    process.on("SIGINT", () => {
        void shutdown("SIGINT");
    });
    process.on("SIGTERM", () => {
        void shutdown("SIGTERM");
    });
};
void startServer().catch((error) => {
    logger_1.logger.error("Application failed to start", {
        error: error instanceof Error ? error.message : "Unknown startup error",
    });
    process.exit(1);
});
//# sourceMappingURL=server.js.map