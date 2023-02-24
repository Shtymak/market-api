import { PossiblePath } from './../types/possible-path.interface';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import mongoose, { Model, Types, Document, Query } from 'mongoose';
import * as path from 'path';
import { FOLDER_PERMISSIONS } from './../roles/permission.enum';
import { UsersService } from './../users/users.service';
import CreateFolderDto from './dto/create-folder.dto';
import UploadFileDto from './dto/upload-file.dto';
import { FILE_ICON, FILE_TYPE, FileInfo } from './file-info.type';
import { File, FileDocument } from './file.model';
import { Folder, FolderDocument } from './folder.model';
import { FolderUser, FolderUserDocument } from './folder.user.model';
import FolderEntriesDto from './dto/folder-entries.dto';
import { FolderEntity } from 'src/types/FolderEntity';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(FolderUser.name)
    private readonly folderUserModel: Model<FolderUserDocument>,
    @InjectModel(Folder.name)
    private readonly folderModel: Model<FolderDocument>,
    @InjectModel(File.name)
    private readonly fileModel: Model<FileDocument>,
    private readonly userSrvice: UsersService,
  ) {}
  private logger = new Logger(FileService.name);

  public async getPermissionForUser(
    userId: string,
    folderId: string,
  ): Promise<string> {
    try {
      const folder = await this.folderModel.findOne({
        $or: [
          { _id: new Types.ObjectId(folderId) },
          { id: new Types.ObjectId(folderId) },
        ],
      });

      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }

      if (folder.id.toString() === userId) {
        return FOLDER_PERMISSIONS.OWNER;
      }
      const folderUser = await this.folderUserModel.findOne({
        user: userId,
        folder: folder.id,
      });

      if (!folderUser) {
        return FOLDER_PERMISSIONS.GUEST;
      }

      return folderUser.role;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting permissions for user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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

  async moveFolder(
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

  async getPossibleMoves(folderId: string): Promise<PossiblePath[]> {
    try {
      return [{ label: 'root', value: 'root' }]; // TODO: Implement this
    } catch (err) {
      // Handle any errors that occur during the file system operations
      console.error(err);
      return [];
    }
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

  public async getFilesByFolderId(id: string): Promise<File[]> {
    try {
      const { files } = await this.getFolderById(id);
      const filesInfo = await this.fileModel.find({ _id: { $in: files } });
      return filesInfo;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // public async getUserDefaultfalders(userId: string): Promise<Folder[]> {
  //   try {
  //     const user = await this.userSrvice.findOne(userId);
  //     const folders = await this.folderUserModel.find({

  public async uploadFile(uploadFile: UploadFileDto): Promise<File> {
    const { folderId, file, creatorId } = uploadFile;
    const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB

    // валідація вхідних параметрів
    if (!folderId || !file || file.size > MAX_FILE_SIZE) {
      throw new HttpException('Invalid file or folder', HttpStatus.BAD_REQUEST);
    }

    try {
      // знайти папку
      const folder = await this.folderModel.findOne({
        $or: [{ _id: folderId }, { id: folderId }],
      });

      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      // отримати інформацію про файл
      console.log(file.mimetype);

      const fileType =
        FILE_TYPE[file.mimetype.split('/')[1].toUpperCase()] ||
        FILE_TYPE.UNKNOWN;
      const fileIcon = FILE_ICON[fileType];
      const fileInfo: FileInfo = {
        lastUpdate: new Date(),
        size: file.size,
        type: fileType,
        icon: fileIcon,
      };

      // отримати шлях до папки

      const logicPath = await this.getPathWithParentFolder(folder);
      console.log(logicPath);

      const staticFolderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        logicPath,
      );

      // зберегти файл
      const fileId = new mongoose.Types.ObjectId();
      const fileExtension = file.mimetype.split('/')[1];
      // доповнюємо шлях до файлу інформацією про розширення файлу
      const filePath = `${staticFolderPath}/${fileId}.${fileExtension}`;

      // створюємо новий файл
      const newFile = await this.fileModel.create({
        name: file.originalname,
        info: fileInfo,
        folder: folder,
        createdBy: creatorId,
        path: filePath,
      });

      // додаємо створений файл до списку файлів в папці
      folder.files.push(newFile);
      await folder.save();

      // зберігаємо файл на сервер
      await new Promise<void>((resolve, reject) => {
        fs.writeFile(filePath, file.buffer, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      // повертаємо створений файл
      return newFile;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async deleteFile(fileId: string): Promise<void> {
    try {
      const fileToDelete = await this.fileModel.findOne({
        $or: [{ _id: fileId }, { id: fileId }],
      });
      if (!fileToDelete) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      // Remove file from the file system
      const filePath = fileToDelete.path;
      await fs.promises.unlink(filePath);

      // Delete file and its associated data from the database
      await this.fileModel.deleteOne({ _id: fileId });
      const folder = await this.folderModel.findOne({
        $or: [{ _id: fileToDelete.folder }, { id: fileToDelete.folder }],
      });
      if (folder) {
        folder.files = folder.files.filter((f) => f.toString() !== fileId);
        await folder.save();
      }
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error deleting file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getFilePathById(id: string): Promise<string> {
    try {
      const file = await this.fileModel.findOne({ $or: [{ id }, { _id: id }] });
      const { path: filePath, name, info } = file;

      const staticPathRegex = /.*\/uploads\/(.*)/;
      const staticPath = path.join(
        'uploads',
        staticPathRegex.exec(filePath)[1],
        `${file.id.toString()}.${info.type}`,
      );

      return staticPath;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getFilesListByFolderId(id: string): Promise<FolderEntriesDto> {
    try {
      const candidateFolder = await this.folderModel.findOne({
        $or: [{ _id: id }, { id }],
      });
      if (!candidateFolder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      const childrenFolders = await this.folderModel.find({
        $or: [
          { parentFolderId: candidateFolder.id },
          { parentFolderId: candidateFolder._id },
        ],
      });
      const childrenFiles = await this.fileModel.find({
        folder: id,
      });

      const users = await this.folderUserModel.find({
        $or: [{ folder: candidateFolder.id }, { folder: candidateFolder._id }],
      });

      return {
        folders: childrenFolders,
        files: childrenFiles,
        users,
      };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting files list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getPathWithParentFolder(folder: FolderEntity): Promise<string> {
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
}
