import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenValidationDto {
  @ApiProperty({ example: '9304fsdv-054-bdbc', description: 'token' })
  @IsString()
  readonly tokens: [TokenPayload];
}

class TokenPayload {
  token: string;
  isValid: boolean;
}
