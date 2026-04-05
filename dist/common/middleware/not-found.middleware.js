"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};
exports.notFoundMiddleware = notFoundMiddleware;
//# sourceMappingURL=not-found.middleware.js.map