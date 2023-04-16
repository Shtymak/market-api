import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/user.model';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}
  private logger = new Logger('PlansController');

  @Get('/')
  @UseGuards(JwtAuthGuard)
  getPlans(@Req() req) {
    const user: User = req.user;
    return {
      plans: this.plansService.getPlans(user.storagePlan as any),
      count: this.plansService.getPlans(user.storagePlan as any).length,
    };
  }
}
