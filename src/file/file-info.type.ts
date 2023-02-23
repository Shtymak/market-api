export class FileInfo {
  type: FILE_TYPE;
  size: number;
  lastUpdate: Date;
  icon: FILE_ICON;
}

export enum FILE_TYPE {
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  'VND.OPENXMLFORMATS-OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT' = 'docx',
  'VND.OPENXMLFORMATS-OFFICEDOCUMENT.SPREADSHEETML.SHEET' = 'xlsx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PPT = 'ppt',
  PPTX = 'pptx',
  TXT = 'txt',
  SVG = 'svg',
  UNKNOWN = 'unknown',
}

export enum FILE_ICON {
  UNKNOWN = 'unknow',
  PDF = 'pdf',
}
