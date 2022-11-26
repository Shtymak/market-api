import { ApiProperty } from '@nestjs/swagger';

export class SendCodeResponseDto {
  @ApiProperty({
    examples: ['Code is not valid', 'Code was sent'],
    description: 'Message',
  })
  message: string;
}
