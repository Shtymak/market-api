import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/category.model';
import { ExemplarSize } from './exemplar-size.enum';
import { ExemplarsColor } from './exemplars.color.map';
export class CategoryItem {
  @ApiProperty({
    example: 'uuod-fsdf-sdfsdxvc-sdf',
    description: 'Id of exemplar',
  })
  public id: string;

  @ApiProperty({ example: 'Rostislav', description: 'Name of exemplar' })
  public name: string;

  @ApiProperty({
    example: 'Fine exemplar',
    description: 'Description of exemplar',
  })
  public description?: string;

  @ApiProperty({ example: 12000, description: 'Views of exemplar' })
  public views = 0;

  @ApiProperty({ example: 'File', description: 'Photo of exemplar' })
  public cover: string;

  @ApiProperty({ example: 'Files', description: 'Photos of exemplar by color' })
  public photos: [ExemplarsColor];

  @ApiProperty({ example: 21.5, description: 'Price of item' })
  public price: number;

  @ApiProperty({
    example: 'XS',
    description: 'Sizes of item',
    type: [ExemplarSize],
  })
  public sizes: [ExemplarSize];

  @ApiProperty({
    example: 'red',
    description: 'Colors of item',
    type: [String],
  })
  public colors: [string];

  @ApiProperty({ example: 4.8, description: 'Rating of item' })
  public rating = 0;

  @ApiProperty({ example: '2021-09-22', description: 'Date of creation' })
  public createdAt = new Date();

  @ApiProperty({ example: '2021-09-22', description: 'Date of update' })
  public updatedAt = new Date();

  @ApiProperty({ example: 'Category', description: 'Category of exemplar' })
  category: Category;

  @ApiProperty({ example: 'true', description: 'Is item visible' })
  visible = true;

  @ApiProperty({ example: 10, description: 'Count of exemplars' })
  count = 1;

  @ApiProperty({ example: '2021-09-22', description: 'Visibility until' })
  visibilityUntil?: Date;

  @ApiProperty({ example: 20, description: 'Discount' })
  discount?: number;
}
