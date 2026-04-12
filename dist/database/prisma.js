"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectFromMySql = exports.connectToMySql = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: ["error", "warn"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
const connectToMySql = async () => {
    await exports.prisma.$connect();
    logger_1.logger.info("MySQL connected");
};
exports.connectToMySql = connectToMySql;
const disconnectFromMySql = async () => {
    await exports.prisma.$disconnect();
    logger_1.logger.info("MySQL disconnected");
};
exports.disconnectFromMySql = disconnectFromMySql;
//# sourceMappingURL=prisma.js.map