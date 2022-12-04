import { Injectable, Logger } from '@nestjs/common';
import { AzureUpload } from './azure.upload';
import { FileClient } from './upload-client';
import { IFileUpload } from './upload.interface';
@Injectable()
export class UploadsService {
  private logger = new Logger(UploadsService.name);

  public async uploadFile(
    name: string,
    buffer: Buffer,
    client: IFileUpload = new AzureUpload(),
  ): Promise<string> {
    try {
      const fileClient = new FileClient(client);
      const url = await fileClient.client.upload(name, buffer);
      this.logger.log(`File uploaded to ${url}`);
      return url;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
