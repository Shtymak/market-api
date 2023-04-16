import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import StripeService from './stripe.service';
import CreateChargeDto from './dto/create-charge.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/user.model';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(@Body() body, @Req() req) {
    const user: User = req.user;
    const { plan } = body;

    return this.stripeService.createCheckoutSession(plan, user);
  }

  @Post('/webhook')
  async handleWebhook(@Body() event: Stripe.Event) {
    await this.stripeService.handleStripeWebhook(event);
  }
}
