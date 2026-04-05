import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { env } from './env';
import { AppError } from '../common/errors/app-error';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true
});

type UploadBufferOptions = {
  buffer: Buffer;
  folder: string;
  publicId: string;
  resourceType: 'image' | 'video';
};

export const uploadBufferToCloudinary = async ({
  buffer,
  folder,
  publicId,
  resourceType
}: UploadBufferOptions) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false
      },
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(new AppError(502, 'Cloudinary upload failed', { details: error }));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};
