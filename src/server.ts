import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import {
  disconnectFromMongo,
  disconnectFromRedis,
  connectToMongo,
  connectToRedis,
} from "./database";
import { platformService } from "./modules/platform/platform.service";
import { usersService } from "./modules/users/users.service";

const startServer = async () => {
  await connectToMongo();
  await connectToRedis();
  await platformService.ensureSettingsDocument();
  await platformService.warmMusicEnabledCache();
  await usersService.ensureAdminAccount();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info("Server started", { port: env.port, environment: env.nodeEnv });
  });

  const shutdown = async (signal: string) => {
    logger.info("Shutdown signal received", { signal });

    server.close(async () => {
      await Promise.allSettled([disconnectFromRedis(), disconnectFromMongo()]);
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

void startServer().catch((error: unknown) => {
  logger.error("Application failed to start", {
    error: error instanceof Error ? error.message : "Unknown startup error",
  });
  process.exit(1);
});
