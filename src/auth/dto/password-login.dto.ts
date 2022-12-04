import { ApiProperty } from '@nestjs/swagger';

export class LoginWithPasswordDto {
  @ApiProperty({ example: 'email@#mail.com', description: 'Email of user' })
  email: string;
  @ApiProperty({ example: 'password', description: 'Password of user' })
  password: string;
}
