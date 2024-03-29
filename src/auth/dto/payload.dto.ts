import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '../../types/Roles.enum';

export class PayloadDto {
  @ApiProperty({ example: '1', description: 'User id' })
  id: string;
  @ApiProperty({ example: 'user@gmail.com', description: 'Mail of user' })
  email: string;
  @ApiProperty({ example: '[USER]', description: 'Roles of user' })
  roles: Roles[];
  @ApiProperty({ example: 'Rostislav', description: 'Name of user' })
  name: string;
  @ApiProperty({ example: 'http://me/1.png', description: 'AvatarUrl' })
  avatar: string;
  @ApiProperty({ example: 'true', description: 'Is user banned?' })
  banned: boolean;
  @ApiProperty({ example: 'base', description: 'Storage plan name' })
  storagePlan: string;
}
