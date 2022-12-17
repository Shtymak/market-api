import { Catalog } from './../catalog/catalog.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes } from 'mongoose';
import { Exemplar } from 'src/exemplars/exemplar.model';
export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @ApiProperty({
    example: 'uuod-fsdf-sdfsdxvc-sdf',
    description: 'Id of category',
  })
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  id: string;

  @ApiProperty({ example: 'Rostislav', description: 'Name of category' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ example: 'File', description: 'Icon of cegory' })
  @Prop({ required: false })
  icon: string;

  @ApiProperty({ example: '2021-09-22', description: 'Date of creation' })
  @Prop({ default: new Date() })
  createdAt: Date;

  @ApiProperty({ example: '2021-09-22', description: 'Date of update' })
  @Prop({ default: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: 'Catalog', description: 'Catalog of category' })
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Catalog', required: true })
  catalog: Catalog;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Exemplar' }] })
  exemplars: Exemplar[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
