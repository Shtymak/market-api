export class FileInfo {
  type: FILE_TYPE;
  size: number;
  lastUpdate: Date;
  icon: FILE_ICON;
}

export enum FILE_TYPE {
  PDF = 'pdf',
}

export enum FILE_ICON {
  UNKNOW = 'unknow',
  PDF = 'pdf',
}
