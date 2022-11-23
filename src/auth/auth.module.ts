import { MailerModule } from '@nestjs-modules/mailer';
import { LoginLink, LoginLinkSchema } from './login-link.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Module({
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
    UsersModule,
    MongooseModule.forFeature([
      { name: LoginLink.name, schema: LoginLinkSchema },
    ]),
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
