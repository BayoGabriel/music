"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const emailSchema = zod_1.z.string().trim().toLowerCase().email();
const passwordSchema = zod_1.z.string().min(8).max(128);
exports.registerSchema = zod_1.z.object({
    email: emailSchema,
    password: passwordSchema
}).strict();
exports.loginSchema = zod_1.z.object({
    email: emailSchema,
    password: passwordSchema
}).strict();
//# sourceMappingURL=auth.validation.js.map