import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
export class FullUserDto extends CreateUserDto {
  @ApiProperty({ example: '1', description: 'Id of user' })
  id: string;

  @ApiProperty({ example: 'hash', description: 'Account password' })
  password: string;
}
