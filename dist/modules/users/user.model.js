"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const roles_1 = require("../../common/constants/roles");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: roles_1.roleValues,
        required: true,
        default: roles_1.Role.USER
    }
}, {
    strict: 'throw',
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=user.model.js.map