import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/user.model';
import { StoragePlan, StoragePlans } from './rate-plan.model';

@Injectable()
export class PlansService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public getPlans = (): StoragePlan[] => {
    return StoragePlans;
  };

  public updatePlan = async (plan: StoragePlan, userId: string) => {
    try {
      await this.userModel.updateOne(
        {
          $or: [{ id: userId }, { _id: userId }],
        },
        {
          $set: {
            storagePlan: plan.name,
          },
        },
      );
    } catch (err) {
      throw new HttpException(
        `Error updating plan: ${err}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  };
}
