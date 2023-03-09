import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FodlerService } from '../file/folder.service';
import { StoragePlan, StoragePlans } from './rate-plan.model';

@Injectable()
export class FolderStorageLimitGuard implements CanActivate {
  constructor(
    private readonly folderService: FodlerService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({ message: 'User is not authorized' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException({ message: 'User is not authorized' });
    }

    const user = this.jwtService.verify(token);
    const currentPlan: StoragePlan = StoragePlans.find(
      (plan) => plan.name === user.storagePlan,
    );

    const storageLimitGB = currentPlan.storageLimit;
    const folderSizeMB = await this.folderService.getFolderSize(user.id);
    const sizeDevideNumber = 1024;
    const folderSizeGB = folderSizeMB / sizeDevideNumber / sizeDevideNumber;

    return folderSizeGB <= storageLimitGB;
  }
}
