import { ApiProperty } from '@nestjs/swagger';

export class BaseEntity {
  @ApiProperty({ example: '9304fsdv-054-bdbc', description: 'Id of entyty' })
  id: number;

  @ApiProperty({ example: '2022-09-22', description: 'Date of creation' })
  createdAt: Date;

  @ApiProperty({ example: '2022-09-22', description: 'Date of update' })
  updatedAt: Date;

  constructor(model: any) {
    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }
}
