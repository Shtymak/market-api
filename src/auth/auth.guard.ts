import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { TokenValidationDto } from './dto/token-validation.dto';
const ERROR_MESSAGE = 'User is not authorized';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  private logger = new Logger(JwtAuthGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      const validationData = await this.redisService.get(user.id);

      if (!validationData) {
        throw new UnauthorizedException({
          message: 'User is not authorized',
        });
      }
      const { tokens }: TokenValidationDto = JSON.parse(validationData);
      const thisToken = tokens.find((t) => t.token === token);

      if (!thisToken || !thisToken.isValid) {
        throw new UnauthorizedException({
          message: ERROR_MESSAGE,
        });
      }

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
