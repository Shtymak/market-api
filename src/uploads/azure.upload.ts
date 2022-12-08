import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { IFileUpload } from './upload.interface';

export class AzureUpload implements IFileUpload {
  private containerClient: ContainerClient;
  private containerName: string;
  private blobServiceClient: BlobServiceClient;
  private connectionString: string;
  private containerURL: string;

  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.connectionString,
    );
    this.containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    this.containerURL = process.env.AZURE_STORAGE_CONTAINER_URL;
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
