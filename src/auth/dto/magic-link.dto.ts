import { ApiProperty } from '@nestjs/swagger';

export class MagicLinkDto {
  @ApiProperty({ example: '000000', description: 'Login code' })
  code: string;

  @ApiProperty({})
  email: string;
}
