import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/user.model';
import { RedisModule } from 'src/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

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
export class PlansModule {}
