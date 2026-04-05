"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const writeLog = (level, message, meta) => {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(meta ?? {})
    };
    const serialized = JSON.stringify(payload);
    if (level === 'error') {
        console.error(serialized);
        return;
    }
    if (level === 'warn') {
        console.warn(serialized);
        return;
    }
    console.log(serialized);
};
exports.logger = {
    info: (message, meta) => writeLog('info', message, meta),
    warn: (message, meta) => writeLog('warn', message, meta),
    error: (message, meta) => writeLog('error', message, meta)
};
//# sourceMappingURL=logger.js.map