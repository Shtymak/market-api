import { CreateUserDto } from './create-user.dto';
export class GetUserDto extends CreateUserDto {
  constructor(partial: Partial<GetUserDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
