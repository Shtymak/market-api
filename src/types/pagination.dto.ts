import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ example: 10, description: 'Elements per page' })
  limit: number;
  @ApiProperty({ example: 1, description: 'Page number' })
  page: number;
}
