import { StoragePlanView } from './../plans/rate-plan.model';
import { StoragePlan } from 'src/plans/rate-plan.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '../types/Roles.enum';
export type UserDocument = User & Document;

@Schema()
export class User {
  @ApiProperty({ example: 'uuod-fsdf-sdfsdxvc-sdf', description: 'Id of user' })
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  id: string;

  @ApiProperty({ example: 'user@gmail.com', description: 'Mail of user' })
  @Prop({ unique: true, required: true })
  email: string;

  @ApiProperty({
    example: 'fwipf123AA',
    description: 'Password for user account',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({ example: 'Rostislav', description: 'Name of user' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ example: '2022-09-22', description: 'Date of birth' })
  @Prop({ default: new Date().getDate() })
  dateOfBirth: Date;

  @ApiProperty({ example: 'File', description: 'Photo/avatar' })
  @Prop({ required: false })
  avatar: string;

  @ApiProperty({ example: 'USER', description: 'Role of account' })
  @Prop({ default: [Roles.USER], required: true })
  roles: Roles[];

  @ApiProperty({ example: 'true', description: 'Is user banned?' })
  @Prop({ default: false, required: true })
  banned: boolean;

  @ApiProperty({ example: '0683730423', description: 'Phone number' })
  @Prop({ required: true })
  phone: string;

  @ApiProperty({ example: 'xxxxxxxxxxxxxxxx', description: 'Google Id' })
  @Prop({ required: false, default: '' })
  googleId: string;

  @ApiProperty({ example: '2021-09-22', description: 'Date of creation' })
  @Prop({ default: new Date() })
  createdAt: Date;

  @ApiProperty({ example: '2021-09-22', description: 'Date of update' })
  @Prop({ default: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: 'base', description: 'Storage plan name' })
  @Prop({ type: String, default: StoragePlanView.BASE })
  storagePlan: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
