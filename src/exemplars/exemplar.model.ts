import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes } from 'mongoose';
import { ExemplarSize } from './exemplar-size.enum';
import { ExemplarsColor } from './exemplars.color.map';
import { Category } from 'src/category/category.model';
export type ExemplarDocument = Exemplar & Document;

@Schema()
export class Exemplar {
  @ApiProperty({
    example: 'uuod-fsdf-sdfsdxvc-sdf',
    description: 'Id of exemplar',
  })
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  id: string;

  @ApiProperty({ example: 'Rostislav', description: 'Name of exemplar' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    example: 'Fine exemplar',
    description: 'Description of exemplar',
  })
  @Prop({ required: false })
  description: string;

  @ApiProperty({ example: 12000, description: 'Views of exemplar' })
  @Prop({ required: false, default: 0 })
  views: number;

  @ApiProperty({ example: 'File', description: 'Photo of exemplar' })
  @Prop({ required: false })
  cover: string;

  @ApiProperty({ example: 'Files', description: 'Photos of exemplar by color' })
  @Prop({ type: [ExemplarsColor], required: false })
  photos: [ExemplarsColor];

  @ApiProperty({ example: 21.5, description: 'Price of item' })
  @Prop({ required: true })
  price: number;

  @ApiProperty({
    example: 'XS',
    description: 'Sizes of item',
    type: [ExemplarSize],
  })
  @Prop({
    type: [{ type: SchemaTypes.String, enum: ExemplarSize }],
    required: true,
  })
  sizes: [ExemplarSize];

  @ApiProperty({
    example: 'red',
    description: 'Colors of item',
    type: [String],
  })
  @Prop({ type: [{ type: SchemaTypes.String }], required: true })
  colors: [string];

  @ApiProperty({ example: 4.8, description: 'Rating of item' })
  @Prop({ required: false, default: 0 })
  rating: number;

  @ApiProperty({ example: '2021-09-22', description: 'Date of creation' })
  @Prop({ default: new Date() })
  createdAt: Date;

  @ApiProperty({ example: '2021-09-22', description: 'Date of update' })
  @Prop({ default: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: 'Category', description: 'Category of exemplar' })
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Category', required: true })
  category: Category;

  @ApiProperty({ example: 'true', description: 'Is item visible' })
  @Prop({ required: false, default: true })
  visible: boolean;

  @ApiProperty({ example: 10, description: 'Count of exemplars' })
  @Prop({ required: false, default: 0 })
  count: number;

  @ApiProperty({ example: '2021-09-22', description: 'Visibility until' })
  @Prop({ required: false })
  visibilityUntil: Date;

  @ApiProperty({ example: 20, description: 'Discount' })
  @Prop({ required: false, default: 0 })
  discount: number;
}

export const ExemplarSchema = SchemaFactory.createForClass(Exemplar);
