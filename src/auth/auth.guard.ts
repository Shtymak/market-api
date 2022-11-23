import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
const ERROR_MESSAGE = 'User is not authorized';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private logger = new Logger(JwtAuthGuard.name);
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({
          message: ERROR_MESSAGE,
        });
      }

      const user = this.jwtService.verify(token);
      req.user = user;
      return true;
    } catch (e: any) {
      this.logger.error(e.message);
      throw new UnauthorizedException({
        message: ERROR_MESSAGE,
      });
    }
  }
}
