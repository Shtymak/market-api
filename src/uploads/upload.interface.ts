export interface IFileUpload {
  upload(name: string, buffer: Buffer): Promise<string>;
}
