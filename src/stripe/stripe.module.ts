import { Module } from '@nestjs/common';
import StripeService from './stripe.service';
import { StripeController } from './stripe.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { PlansModule } from 'src/plans/plans.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    RedisModule,
    PlansModule,
  ],
})
export class StripeModule {}
