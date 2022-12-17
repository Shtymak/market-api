import { Category } from './../category/category.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes } from 'mongoose';
export type CatalogDocument = Catalog & Document;

@Schema()
export class Catalog {
  @ApiProperty({
    example: 'uuod-fsdf-sdfsdxvc-sdf',
    description: 'Id of catalog',
  })
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  id: string;

  @ApiProperty({ example: 'Rostislav', description: 'Name of catalog' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ example: 'File', description: 'Photo of catalog' })
  @Prop({ required: false })
  picture: string;

  @ApiProperty({ example: '2021-09-22', description: 'Date of creation' })
  @Prop({ default: new Date() })
  createdAt: Date;

  @ApiProperty({ example: '2021-09-22', description: 'Date of update' })
  @Prop({ default: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: 'Category', description: 'Categories of catalog' })
  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Category' }] })
  categories: Category[];
}

export const CatalogSchema = SchemaFactory.createForClass(Catalog);
