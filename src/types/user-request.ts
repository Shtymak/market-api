import { GetUserDto } from './../users/dto/get-user.dto';
import { Request } from 'express';
export abstract class RequestWithUser extends Request {
  user: GetUserDto;
}
