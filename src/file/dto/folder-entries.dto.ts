import { FolderUser } from './../folder.user.model';
import { Folder } from '../folder.model';
import { File } from '../file.model';
export default class FolderEntriesDto {
  folders: Folder[];
  files: File[];
  users: FolderUser[];
}
