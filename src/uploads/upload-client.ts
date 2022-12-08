import { IFileUpload } from './upload.interface';

export class FileClient {
  public client: IFileUpload;

  constructor(client: IFileUpload) {
    this.client = client;
  }
}
