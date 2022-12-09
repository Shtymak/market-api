import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendCodeDto {
  @ApiProperty({ example: 'vsh.gmail.com' })
  @IsEmail()
  email: string;
}
