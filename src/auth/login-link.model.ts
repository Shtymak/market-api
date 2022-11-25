import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
export type LoginLinkDocument = LoginLink & Document;

@Schema()
export class LoginLink {
  @ApiProperty({ example: '9304fsdv-054-bdbc', description: 'link ' })
  @Prop({ required: true })
  link: string;

  @ApiProperty({ example: '9304fsdv-054-bdbc', description: 'user id' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @ApiProperty({ example: false, description: 'link is actived' })
  @Prop({ required: true })
  isActived: boolean;

  @ApiProperty({ example: '22-09-2022', description: 'date of creation' })
  @Prop({ required: false, default: new Date() })
  createdAt: Date;
}

export const LoginLinkSchema = SchemaFactory.createForClass(LoginLink);
