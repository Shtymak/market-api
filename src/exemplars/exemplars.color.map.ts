import { ApiProperty } from '@nestjs/swagger';

export class ExemplarsPicture {
  @ApiProperty({
    example: 'https://exemplars.com.ua/pictures/1.jpg',
    description: 'Url of picture',
  })
  public url: string;

  @ApiProperty({ example: '#000000', description: 'Color of picture' })
  public colorCode: string;
}

export class ExemplarsColor {
  public color: string;
  public pictures: ExemplarsPicture[];
}
