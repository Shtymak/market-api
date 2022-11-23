import { Roles } from './../../types/Roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Mail of user' })
  email: string;

  @ApiProperty({
    example: 'fwipf123AA',
    description: 'Password for user account',
  })
  password: string;

  @ApiProperty({ example: 'Rostislav', description: 'Name of user' })
  name: string;

  @ApiProperty({ example: '2022-09-22', description: 'Date of birth' })
  dateOfBirth: Date;

  @ApiProperty({ example: 'File', description: 'Photo/avatar' })
  avatar: string;

  @ApiProperty({ example: 'USER', description: 'Role of account' })
  roles: Roles[];

  @ApiProperty({ example: 'true', description: 'Is user banned?' })
  banned: boolean;

  @ApiProperty({ example: '0683730423', description: 'Phone number' })
  phone: string;

  @ApiProperty({ example: 'xxxxxxxxxxxxxxxx', description: 'Google Id' })
  googleId: string;

  constructor(model: Partial<CreateUserDto>) {
    Object.assign(this, model);
  }
}
