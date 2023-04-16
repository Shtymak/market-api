import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlansService } from 'src/plans/plans.service';
import { StoragePlan, StoragePlans } from 'src/plans/rate-plan.model';
import { User } from 'src/users/user.model';
import Stripe from 'stripe';

@Injectable()
export default class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private readonly plansService: PlansService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2022-11-15',
    });
  }
  public async createCustomer(
    name: string,
    email: string,
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      name,
      email,
    });
  }

  public async createCheckoutSession(plan: StoragePlan, user: User) {
    const product = await this.stripe.products.create({
      name: plan.name.toLocaleUpperCase(),
      type: 'service',
      images: [plan.imageUrl],
      description: plan.description,
      //   caption: plan.description,
    });

    const price = await this.stripe.prices.create({
      unit_amount: plan.price * 100, // Convert to cents
      currency: 'usd',
      product: product.id,
    });
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: {
          planId: plan.name,
          userId: user.id,
        },
      },
      mode: 'payment',
      // TODO: configure  domain in .env
      success_url: 'http://localhost:3000/folders',
      cancel_url: 'http://localhost:3000/plans',
      metadata: {
        planId: `${plan.name}`,
      },
    });

    return session;
  }

  public async handleStripeWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('LOG:', JSON.stringify(paymentIntent));

          await this.handlePaymentSuccess(paymentIntent);
          break;
        // Додайте обробку інших типів подій, якщо потрібно
        default:
          console.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error handling Stripe webhook: ${error.message}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // Логіка обробки успішної оплати
    console.log(`Payment succeeded with id: ${paymentIntent.id}`);
    const planId = paymentIntent.metadata.planId;

    const plan = StoragePlans.find((plan) => plan.name === planId);
    const userId = paymentIntent.metadata.userId;

    // TODO: check if user already has this plan or more expensive one

    await this.plansService.updatePlan(plan, userId);
  }
}
