import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { BaseEntity } from 'src/types/Base.entity';
import { FullUserDto } from 'src/users/dto/full-user.dto';
import { Roles } from '../../types/Roles.enum';
import { User } from '../user.model';

const minNameLength = 3;
const maxNameLength = 21;
export class GetUserDto extends BaseEntity {
  @ApiProperty({ example: 'user@gmail.com', description: 'Mail of user' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'fwipf123AA',
    description: 'Password for user account',
  })
  @ApiProperty({ example: 'Rostislav', description: 'Name of user' })
  @IsString()
  @Length(minNameLength, maxNameLength)
  name: string;

  @ApiProperty({ example: '2022-09-22', description: 'Date of birth' })
  @IsDateString()
  dateOfBirth?: Date;

  @ApiProperty({ example: 'File', description: 'Photo/avatar' })
  avatar?: string;

  @ApiProperty({ example: 'USER', description: 'Role of account' })
  roles: Roles[];

  @ApiProperty({ example: 'true', description: 'Is user banned?' })
  @IsBoolean()
  banned: boolean;

  @ApiProperty({ example: '0683730423', description: 'Phone number' })
  @IsPhoneNumber('UA')
  phone: string;

  @ApiProperty({ example: 'xxxxxxxxxxxxxxxx', description: 'Google Id' })
  googleId: string;

  constructor(model: User | FullUserDto) {
    super(model);
    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.email = model.email;
    this.name = model.name;
    this.dateOfBirth = model.dateOfBirth;
    this.avatar = model.avatar || null;
    this.roles = model.roles;
    this.banned = model.banned;
    this.phone = model.phone;
    this.googleId = model.googleId;
  }
}
