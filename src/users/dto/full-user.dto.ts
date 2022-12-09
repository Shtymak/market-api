import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.model';
import { CreateUserDto } from './create-user.dto';
export class FullUserDto extends CreateUserDto {
  @ApiProperty({ example: 'hash', description: 'Account password' })
  password: string;

  constructor(model: User) {
    super(model);
  }
}
