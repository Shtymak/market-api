import { ConfigService } from '@nestjs/config';
import { RedisModule } from './../redis/redis.module';
import { FolderUser, FolderUserSchema } from './folder.user.model';
import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { Folder, FolderSchema } from './folder.model';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema, File } from './file.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [
    MongooseModule.forFeature([
      { name: Folder.name, schema: FolderSchema },
      {
        name: FolderUser.name,
        schema: FolderUserSchema,
      },
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    RedisModule,
  ],
})
export class FileModule {}
