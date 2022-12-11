import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

const minPasswordLength = 8;
const maxPasswordLength = 32;
export class ResetPasswordDto {
  @ApiProperty({ example: 'new password', description: 'New password' })
  @IsString()
  @Length(minPasswordLength, maxPasswordLength)
  password: string;
}
