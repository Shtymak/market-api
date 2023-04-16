import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/user.model';
import { StoragePlan, StoragePlanView, StoragePlans } from './rate-plan.model';
import { PlanFactory } from './plan.factory';

@Injectable()
export class PlansService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public getPlans = (currentUserPlan: StoragePlanView): StoragePlan[] => {
    return PlanFactory.getAvailablePlans(currentUserPlan);
  };
  public updatePlan = async (plan: StoragePlan, userId: string) => {
    try {
      const user = await this.userModel.findOne({
        $or: [{ id: userId }, { _id: userId }],
      });
      if (!user) {
        throw new HttpException(
          `User with id ${userId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        !PlanFactory.canBuy(
          user.storagePlan as StoragePlanView,
          plan.name as StoragePlanView,
        )
      ) {
        throw new HttpException(
          `User with id ${userId} can't buy plan ${plan.name}`,
          HttpStatus.BAD_REQUEST,
        );
      }
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
