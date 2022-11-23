import { ApiProperty } from '@nestjs/swagger';

export class CreateMailDto {
  @ApiProperty({ example: 'email@g.com', description: 'Just email' })
  to: string;
  @ApiProperty({ example: 'Hello', description: 'Subject of mail' })
  subject: string;
  @ApiProperty({ example: 'Hello', description: 'Text of mail' })
  content: string;
}
