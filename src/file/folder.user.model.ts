import { User } from './../users/user.model';
import { Folder } from './folder.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes } from 'mongoose';
export type FolderUserDocument = FolderUser & Document;

@Schema()
export class FolderUser {
  @ApiProperty({
    example: 'uuod-fsdf-sdfsdxvc-sdf',
    description: 'Id of folder',
  })
  @Prop({ type: Folder, ref: 'Folder', required: true })
  folder: Folder;

  @ApiProperty({ example: 'uuod-fsdf-sdfsdxvc-sdf', description: 'Id of user' })
  @Prop({ type: SchemaTypes.ObjectId, auto: true, ref: 'User' })
  user: User;

  @ApiProperty({
    example: 'owner',
    description: 'Role of user for this folder',
  })
  role: string;
}

export const FolderUserSchema = SchemaFactory.createForClass(FolderUser);
