import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/category.model';
import { ExemplarSize } from './exemplar-size.enum';
import { ExemplarsColor } from './exemplars.color.map';

class Item {
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

  constructor(data: SimplePayload) {
    this.name = data.name;
    this.price = data.price;
    this.category = data.category;
  }
}
export class ClouthItem extends Item {
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

  constructor(data: Payload) {
    super(data);
    this.sizes = data.sizes;
    this.colors = data.colors;
  }
}

export class AccessoryItem extends Item {
  @ApiProperty({ example: 'red', description: 'Color of item' })
  public color: string;

  constructor(data: Payload) {
    super(data);
    this.color = data.color;
  }
}

export class ShoeItem extends Item {
  @ApiProperty({ example: 'XS', description: 'Size of item' })
  public sizes: [ExemplarSize];

  @ApiProperty({ example: 'red', description: 'Color of item' })
  public color: string;

  @ApiProperty({ example: 'Sentetik', description: 'Material of item' })
  public material: string;

  constructor(data: Payload) {
    super(data);
    this.sizes = data.sizes;
    this.color = data.color;
    this.material = data.material;
  }
}

export class ExemplarFactory {
  public static exemplarTypes = {
    clouth: ClouthItem,
    accessory: AccessoryItem,
    shoe: ShoeItem,
  };

  public static exemplarTypeKeys: Readonly<{
    clouth: 'clouth';
    accessory: 'accessory';
    shoe: 'shoe';
  }> = {
    clouth: 'clouth',
    accessory: 'accessory',
    shoe: 'shoe',
  };

  public createExemplar(type: string, payload: Payload) {
    const Exemplar =
      ExemplarFactory.exemplarTypes[type] ||
      ExemplarFactory.exemplarTypes.clouth;
    return new Exemplar(payload);
  }
}

type SimplePayload = {
  name: string;
  price: number;
  category: Category;
};

type Payload = SimplePayload & {
  sizes?: [ExemplarSize];
  colors?: [string];
  color?: string;
  material?: string;
};
