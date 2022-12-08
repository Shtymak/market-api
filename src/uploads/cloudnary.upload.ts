import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { IFileUpload } from './upload.interface';

export class CloudinaryUpload implements IFileUpload {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  async upload(name: string, buffer: Buffer): Promise<string> {
    const promise = new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: `uploads/${name}`,
            resource_type: 'raw',
            folder: 'Files',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(buffer);
    });
    const result = await promise;
    return result.secure_url;
  }
}
