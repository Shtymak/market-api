export class FileInfo {
  type: FILE_TYPE;
  size: number;
  lastUpdate: Date;
  icon: FILE_ICON;
}

export enum FILE_TYPE {
  PDF = 'pdf',
  UNKNOWN = 'unknown',
}

export enum FILE_ICON {
  UNKNOWN = 'unknow',
  PDF = 'pdf',
}
