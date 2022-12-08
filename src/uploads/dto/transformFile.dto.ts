import { ApiProperty } from '@nestjs/swagger';

export class TransformFileDto {
  @ApiProperty({
    example: 'img.jpeg',
    description: 'The request file from Multer',
  })
  public file: Express.Multer.File;

  @ApiProperty({
    example: 'img.jpeg',
    description: 'The buffer of file for compression',
  })
  public buffer: Buffer;

  constructor(file: Express.Multer.File, buffer: Buffer) {
    this.file = file;
    this.buffer = buffer;
  }
}
