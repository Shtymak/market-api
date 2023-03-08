import { IsNotEmpty, IsString } from 'class-validator';

export class RenameFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
