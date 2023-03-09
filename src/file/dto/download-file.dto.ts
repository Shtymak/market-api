import { IsNotEmpty, IsString } from 'class-validator';

export class DownloadFileDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;
}
