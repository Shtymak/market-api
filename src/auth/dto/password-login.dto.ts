import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
const minPasswordLength = 8;
const maxPasswordLength = 32;
export class LoginWithPasswordDto {
  @ApiProperty({ example: 'email@#mail.com', description: 'Email of user' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'password', description: 'Password of user' })
  @IsString()
  @Length(minPasswordLength, maxPasswordLength)
  password: string;
}
