import { FOLDER_PERMISSIONS } from './../../roles/permission.enum';
export default class CreateFolderDto {
  name: string;
  parentFolderId?: string;
  role: string;
}
