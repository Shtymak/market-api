import { FileInfo } from './file-info.type';
import { User } from './../users/user.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes } from 'mongoose';
import { Folder } from './folder.model';
export type FileDocument = File & Document;

@Schema()
export class File {
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

  @ApiProperty({ example: 'Documents/fit', description: 'Name of folder' })
  @Prop({ required: true })
  path: string;

  @ApiProperty({
    example: 'uuod-fsdf-sdfsdxvc-sdf',
    description: 'Id of parent folder',
  })
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Folder' })
  folder: Folder;

  @ApiProperty({ example: 'eax-eer-erte-cdscs', description: 'Ref for user' })
  @Prop({ type: String, required: true, unique: false })
  createdBy: string;

  @ApiProperty({
    example: { type: '.jpg', icon: 'default' },
    description: 'Info about file',
  })
  @Prop({ type: FileInfo, required: true })
  info: FileInfo;
}

export const FileSchema = SchemaFactory.createForClass(File);
