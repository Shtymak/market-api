import { GetUserDto } from '../../users/dto/get-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetAuthDto {
  @ApiProperty({ example: 'token', description: 'JWT token' })
  token: string;

  @ApiProperty({ example: 'user', description: 'User' })
  user: GetUserDto;

  constructor(partial: Partial<GetAuthDto>) {
    Object.assign(this, partial);
  }
}
