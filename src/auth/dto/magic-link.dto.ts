import { ApiProperty } from '@nestjs/swagger';

export class MagicLinkDto {
  @ApiProperty({ example: 'me/link', description: 'Login link' })
  link: string;
}
