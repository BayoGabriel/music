"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const app_error_1 = require("../common/errors/app-error");
cloudinary_1.v2.config({
    cloud_name: env_1.env.cloudinaryCloudName,
    api_key: env_1.env.cloudinaryApiKey,
    api_secret: env_1.env.cloudinaryApiSecret,
    secure: true
});
const uploadBufferToCloudinary = async ({ buffer, folder, publicId, resourceType }) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            public_id: publicId,
            resource_type: resourceType,
            use_filename: false,
            unique_filename: true,
            overwrite: false
        }, (error, result) => {
            if (error || !result) {
                reject(new app_error_1.AppError(502, 'Cloudinary upload failed', { details: error }));
                return;
            }
            resolve(result);
        });
        uploadStream.end(buffer);
    });
};
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
//# sourceMappingURL=cloudinary.js.map