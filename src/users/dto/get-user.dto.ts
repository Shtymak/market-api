import { User } from '../user.model';
import { CreateUserDto } from './create-user.dto';
export class GetUserDto extends CreateUserDto {
  constructor(partial: User) {
    super(partial);
  }
}
