import { Injectable, Logger, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';
import { TransformFileDto } from '../src/uploads/dto/transformFile.dto';

export const AVATAR_MAX_SIZE = 500;
export const AVATAR_QUALITY = 100;
export const AVATAR_COMPRESSION = 2;
@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<TransformFileDto>>
{
  private logger = new Logger(SharpPipe.name);
  async transform(avatar: Express.Multer.File): Promise<TransformFileDto> {
    return await sharp(avatar.buffer)
      .resize(AVATAR_MAX_SIZE, AVATAR_MAX_SIZE)
      .png({
        quality: AVATAR_QUALITY,
        compressionLevel: AVATAR_COMPRESSION,
      })
      .toBuffer()
      .then((data) => new TransformFileDto(avatar, data));
  }
}
