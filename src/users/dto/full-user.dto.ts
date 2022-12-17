import { BaseEntity } from 'src/types/Base.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { Roles } from 'src/types/Roles.enum';
import { User } from '../user.model';
const minPasswordLength = 8;
const maxPasswordLength = 32;
const minNameLength = 3;
const maxNameLength = 21;
export class FullUserDto extends BaseEntity {
  @ApiProperty({ example: 'user@gmail.com', description: 'Mail of user' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'fwipf123AA',
    description: 'Password for user account',
  })
  @IsNotEmpty()
  @Length(minPasswordLength, maxPasswordLength)
  password: string;

  @ApiProperty({ example: 'Rostislav', description: 'Name of user' })
  @IsString()
  @Length(minNameLength, maxNameLength)
  name: string;

  @ApiProperty({ example: '2022-09-22', description: 'Date of birth' })
  @IsDateString()
  dateOfBirth: Date;

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

  constructor(model: User) {
    super(model);
    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.email = model.email;
    this.password = model.password;
    this.name = model.name;
    this.dateOfBirth = model.dateOfBirth;
    this.avatar = model.avatar;
    this.roles = model.roles;
    this.banned = model.banned;
    this.phone = model.phone;
    this.googleId = model.googleId;
  }
}
