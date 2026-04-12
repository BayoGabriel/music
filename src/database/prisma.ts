import { PrismaClient } from "@prisma/client";
import { logger } from "../config/logger";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const connectToMySql = async () => {
  await prisma.$connect();
  logger.info("MySQL connected");
};

export const disconnectFromMySql = async () => {
  await prisma.$disconnect();
  logger.info("MySQL disconnected");
};
