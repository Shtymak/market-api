import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class MagicLinkDto {
  @ApiProperty({ example: '000000', description: 'Login code' })
  @IsString()
  @Length(6, 6, { message: 'Code must be 6 characters long' })
  code: string;

  @ApiProperty({ example: 'text@gamil.com', description: 'Email' })
  @IsEmail()
  email: string;
}
