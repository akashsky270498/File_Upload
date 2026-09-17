import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import streamifier from 'streamifier';
import { AppError } from '../common/errors/app-error';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  resource_type: string;
}

export class CloudinaryService {
  /**
   * Upload Buffer to Cloudinary using Streamifier
   */
  public async uploadStream(
    fileBuffer: Buffer,
    folder: string,
    resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `omnimedia/${folder}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            return reject(new AppError(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`, 502, 'EXTERNAL_SERVICE_ERROR'));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            format: result.format,
            resource_type: result.resource_type,
          });
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Delete asset from Cloudinary (Compensating Transaction)
   */
  public async deleteAsset(publicId: string, resourceType: 'auto' | 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      throw new AppError('Failed to execute Cloudinary deletion compensating transaction', 500, 'COMPENSATING_TRANSACTION_FAILED');
    }
  }
}

export const cloudinaryService = new CloudinaryService();
