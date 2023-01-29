import { FolderUser, FolderUserSchema } from './folder.user.model';
import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { Folder, FolderSchema } from './folder.model';
import { MongooseModule } from '@nestjs/mongoose';

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
    ]),
  ],
})
export class FileModule {}
