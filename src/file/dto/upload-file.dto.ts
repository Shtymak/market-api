export default class UploadFileDto {
  name: string;
  folderId: string;
  file: Express.Multer.File;
  creatorId: string;
}
