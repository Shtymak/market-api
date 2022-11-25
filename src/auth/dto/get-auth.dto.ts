import { GetUserDto } from '../../users/dto/get-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetAuthDto {
  @ApiProperty({ example: 'token', description: 'JWT token' })
  token: string;

  @ApiProperty({ example: 'user', description: 'User' })
  user: GetUserDto;

  constructor(token: string, user: GetUserDto) {
    this.token = token;
    this.user = user;
  }
}
