import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AuthMailDto {
  @ApiProperty({ example: 'vsh.gmail.com' })
  @IsEmail()
  email: string;
}
