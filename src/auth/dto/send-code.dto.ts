import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({ example: 'vsh.gmail.com' })
  email: string;
}
