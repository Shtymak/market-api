import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { IFileUpload } from './upload.interface';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export class AzureUpload implements IFileUpload {
  private containerClient: ContainerClient;
  private containerName: string;
  private blobServiceClient: BlobServiceClient;
  private connectionString: string;
  private containerURL: string;

  constructor() {
    this.connectionString = configService.get('azure.connectionString');
    this.containerName = configService.get('azure.containerName');
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.connectionString,
    );
    this.containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    this.containerURL = configService.get('azure.containerURL');
  }

  async upload(name: string, buffer: Buffer): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(name);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: 'application/pdf',
      },
    });
    return `${this.containerURL}/${name}`;
  }
}
