import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes } from 'mongoose';
import { File } from './file.model';
export type FolderDocument = Folder & Document;
@Schema()
export class Folder {
  @ApiProperty({ example: 'uuod-fsdf-sdfsdxvc-sdf', description: 'Id of user' })
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  id: string;

  @ApiProperty({ example: ' 2021-09-22', description: 'Date of creation' })
  @Prop({ default: new Date() })
  createdAt: Date;

  @ApiProperty({ example: ' 2021-09-22', description: 'Date of update' })
  @Prop({ default: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: 'Documents', description: 'Name of folder' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: 'uuod-fsdf-sdfsdxvc-sdf',
    description: 'Id of parent folder',
  })
  @Prop({ type: SchemaTypes.ObjectId, required: false })
  parentFolderId: string;

  @ApiProperty({ example: 'files', description: 'files in folder' })
  @Prop({
    type: [SchemaTypes.ObjectId],
    required: true,
    ref: 'File',
    default: [],
  })
  files: File[];
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
