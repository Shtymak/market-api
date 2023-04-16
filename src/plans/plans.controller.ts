import { Controller, Get, Logger } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}
  private logger = new Logger('PlansController');

  @Get('/')
  getPlans() {
    return {
      plans: this.plansService.getPlans(),
      count: this.plansService.getPlans().length,
    };
  }
}
