import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Folder, FolderDocument } from './folder.model';
import { Model } from 'mongoose';
import { FolderUser, FolderUserDocument } from './folder.user.model';
import { FileDocument } from './file.model';
import CreateFolderDto from './dto/create-folder.dto';
import * as path from 'path';
import * as fs from 'fs';
import { FolderEntity } from 'src/types/FolderEntity';
import { PossiblePath } from 'src/types/possible-path.interface';
import { File } from './file.model';
@Injectable()
export class FodlerService {
  constructor(
    @InjectModel(FolderUser.name)
    private readonly folderUserModel: Model<FolderUserDocument>,
    @InjectModel(Folder.name)
    private readonly folderModel: Model<FolderDocument>,
    @InjectModel(File.name)
    private readonly fileModel: Model<FileDocument>,
  ) {}
  private logger = new Logger(FodlerService.name);

  public async createFolder(
    folderDto: CreateFolderDto,
    ownerId: string,
  ): Promise<Folder> {
    try {
      const { name, parentFolderId, role } = folderDto;
      const staticFolderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
      );

      // Перевіряємо, чи існує батьківська тека з заданим ідентифікатором
      let parentFolder;
      if (parentFolderId) {
        parentFolder = await this.folderModel.findOne({
          $or: [{ _id: parentFolderId }, { id: parentFolderId }],
        });
        if (!parentFolder) {
          throw new HttpException(
            'Parent folder not found',
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        // якщо parentFolderId не задано, перевіряємо чи існує коренева тека з ідентифікатором ownerId
        parentFolder = await this.folderModel.findOne({
          $or: [{ _id: ownerId }, { id: ownerId }],
        });
        if (!parentFolder) {
          // якщо кореневої теки немає, створюємо її
          parentFolder = await this.folderModel.create({
            name: 'root',
            id: ownerId,
          });
        }
      }

      // Створюємо нову теку в базі даних
      const folder = await this.folderModel.create({
        name,
        parentFolderId: parentFolder.id,
      });

      // Додаємо права доступу користувача до теки
      await this.folderUserModel.create({
        user: ownerId,
        role,
        folder: folder.id,
      });

      // Створюємо шлях до нової теки
      let folderPath = staticFolderPath;
      if (parentFolder) {
        const logicPath = await this.getPathWithParentFolder(parentFolder);
        folderPath = path.join(folderPath, logicPath);
      }
      folderPath = path.join(folderPath, folder._id.toString());

      // Створюємо нову теку в файловій системі
      await fs.promises.mkdir(folderPath, { recursive: true });

      return folder;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error creating folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async moveFolder(
    folderId: string,
    newParentFolderId: string,
  ): Promise<Folder> {
    const folder = await this.folderModel.findOne({ _id: folderId });
    if (!folder) {
      throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    }

    const newParentFolder = await this.folderModel.findOne({
      _id: newParentFolderId,
    });
    if (!newParentFolder) {
      throw new HttpException(
        'New parent folder not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check that the new parent folder is not a child of the folder being moved
    let parent = newParentFolder;
    while (parent) {
      if (parent._id.toString() === folderId) {
        throw new HttpException(
          'Cannot move folder to its own child',
          HttpStatus.BAD_REQUEST,
        );
      }
      parent = await this.folderModel.findOne({ _id: parent.parentFolderId });
    }

    folder.parentFolderId = newParentFolderId;
    await folder.save();

    // Move all child folders to the new parent folder
    const childFolders = await this.folderModel.find({
      parentFolderId: folderId,
    });
    for (const childFolder of childFolders) {
      childFolder.parentFolderId = newParentFolderId;
      await childFolder.save();
    }

    return folder;
  }

  public async getPathWithParentFolder(folder: FolderEntity): Promise<string> {
    const pathParts: string[] = [];
    let currentFolder = folder;
    while (currentFolder.parentFolderId) {
      const parentFolder = await this.folderModel.findOne({
        $or: [
          { _id: currentFolder.parentFolderId },
          { id: currentFolder.parentFolderId },
        ],
      });
      if (!parentFolder) {
        throw new HttpException(
          'Parent folder not found',
          HttpStatus.NOT_FOUND,
        );
      }
      pathParts.push(currentFolder._id.toString());
      currentFolder = parentFolder;
    }
    pathParts.push(currentFolder._id.toString());
    return pathParts.reverse().join('/');
  }

  public async deleteFolder(folderId: string): Promise<void> {
    try {
      const folderToDelete = await this.folderModel.findOne({
        $or: [{ _id: folderId }, { id: folderId }],
      });
      if (!folderToDelete) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }

      // Remove folder and its contents from the file system
      const folderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        await this.getPathWithParentFolder(folderToDelete),
        folderToDelete._id.toString(),
      );
      await fs.promises.rmdir(folderPath, { recursive: true });

      // Delete folder and its associated data from the database
      await this.folderModel.deleteOne({ _id: folderToDelete._id });
      await this.folderUserModel.deleteMany({ folder: folderToDelete.id });
      await this.fileModel.deleteMany({
        $or: [{ folder: folderToDelete.id }, { folder: folderToDelete.id }],
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error deleting folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async getRootFolder(folderId: string): Promise<Folder> {
    let currentFolder = await this.folderModel.findOne({
      $or: [{ _id: folderId }, { id: folderId }],
    });
    if (!currentFolder) {
      throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    }

    while (currentFolder && currentFolder.parentFolderId) {
      currentFolder = await this.folderModel.findOne({
        $or: [
          { _id: currentFolder.parentFolderId },
          { id: currentFolder.parentFolderId },
        ],
      });
    }
    this.logger.debug('Root folder: ' + currentFolder);
    return currentFolder;
  }

  async getPossibleMoves(folderId: string): Promise<PossiblePath[]> {
    const possiblePaths: PossiblePath[] = [];
    const currentFolder = (await this.getFolderById(folderId)) as FolderEntity;
    const rootFolder = await this.getRootFolder(folderId);
    const visited = new Set<string>();

    const queue: { folder: FolderEntity; parentPath: string }[] = [
      { folder: rootFolder as FolderEntity, parentPath: '' },
    ];
    while (queue.length > 0) {
      const { folder, parentPath } = queue.shift();
      if (
        visited.has(folder.id.toString()) ||
        visited.has(folder._id.toString())
      ) {
        continue;
      }
      visited.add(folder.id.toString());
      if (folder.id.toString() === currentFolder.id.toString()) {
        continue;
      }
      if (
        folder.id.toString() !== currentFolder.id.toString() &&
        folder._id.toString() !== currentFolder._id.toString() &&
        folder.id.toString() !== currentFolder.parentFolderId.toString() &&
        folder._id.toString() !== currentFolder.parentFolderId.toString()
      ) {
        possiblePaths.push({
          value: folder._id,
          label: path.join(parentPath, folder.name),
        });
      }

      const childFolders = await this.folderModel.find({
        $or: [{ parentFolderId: folder.id }, { parentFolderId: folder._id }],
      });
      for (const childFolder of childFolders) {
        queue.push({
          folder: childFolder,
          parentPath: path.join(parentPath, folder.name),
        });
      }
    }

    return possiblePaths;
  }

  public async getFolderById(id: string): Promise<Folder> {
    try {
      const folder = await this.folderModel.findOne({
        $or: [{ _id: id }, { id: id }],
      });
      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      return folder;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
