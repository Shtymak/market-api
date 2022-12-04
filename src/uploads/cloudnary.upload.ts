import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { IFileUpload } from './upload.interface';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export class CloudinaryUpload implements IFileUpload {
  constructor() {
    cloudinary.config({
      cloud_name: configService.get('cloudinary.cloud_name'),
      api_key: configService.get('cloudinary.api_key'),
      api_secret: configService.get('cloudinary.api_secret'),
    });
  }
  async upload(name: string, buffer: Buffer): Promise<string> {
    const promise = new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: `pdfs/${name}.pdf`,
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
