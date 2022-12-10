import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginWithPasswordDto } from './dto/password-login.dto';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { GetAuthDto } from './dto/get-auth.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { MagicLinkDto } from './dto/magic-link.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { SendCodeResponseDto } from './dto/send-code-response.dto';
import { AuthMailDto } from './dto/auth-mail.dto';
import * as path from 'path';
import { ThankYouPage } from './thank.you.page';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with magic code' })
  @ApiBody({ type: MagicLinkDto })
  @ApiResponse({ status: HttpStatus.OK, type: GetAuthDto })
  @ApiNotFoundResponse({
    description: 'Code is not found',
    type: SendCodeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Code is not valid',
    type: SendCodeResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Code is already used or expired',
    type: SendCodeResponseDto,
  })
  @Post('login/code')
  async loginWithCode(@Body() body: MagicLinkDto, @Res() response: Response) {
    try {
      const token = await this.authService.magicLogin(body);
      response.status(HttpStatus.OK).json(token);
    } catch (e) {
      response.status(e.status).json({
        message: e.message,
      });
    }
  }

  @Post('login/password')
  async loginWithPassword(
    @Body() body: LoginWithPasswordDto,
    @Res() response: Response,
  ) {
    try {
      console.log(body);

      const token = await this.authService.loginWithPassword(body);
      console.log(token);

      response.status(HttpStatus.OK).json(token);
    } catch (e) {
      response.status(e.status).json({
        message: e.message,
      });
    }
  }

  @ApiOperation({ summary: 'Login with magic code' })
  @ApiBody({ type: MagicLinkDto })
  @ApiResponse({ status: HttpStatus.OK, type: SendCodeResponseDto })
  @Post('send/code')
  async sendCode(@Body() body: SendCodeDto, @Res() response: Response) {
    try {
      const token = await this.authService.sendLoginMagicLink(body.email);
      response
        .status(HttpStatus.OK)
        .json({ message: 'Code sent', isCodeSent: token });
    } catch (e) {
      response.status(e.status).json({
        message: e.message,
      });
    }
  }

  @ApiOperation({ summary: 'Registration' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.OK, type: GetAuthDto })
  @Post('register')
  async register(@Body() body: CreateUserDto, @Res() response: Response) {
    try {
      const token = await this.authService.registration(body);
      response.status(HttpStatus.OK).json(token);
    } catch (e) {
      response.status(e.status).json({
        message: e.message,
      });
    }
  }
  @Post('reset/password/send')
  @ApiOperation({
    summary: 'Reset password email',
  })
  @ApiBody({ type: AuthMailDto })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  async reset(@Body() body: AuthMailDto, @Res() response: Response) {
    try {
      const dto = await this.authService.sendResetPasswordLink(body.email);
      return response
        .status(HttpStatus.OK)
        .json({ message: 'Password reset mail sent', flag: dto });
    } catch (e) {
      response.status(e.status).json({
        message: e.message,
      });
    }
  }

  @Get('reset/password/:uuid')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: HttpStatus.OK, type: GetAuthDto })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Res() response: Response, @Param('uuid') uuid: string) {
    try {
      await this.authService.resetPassword(uuid);
      const thatkYouHtml = ThankYouPage;
      response.status(HttpStatus.OK).send(thatkYouHtml);
    } catch (e) {
      response.status(e.status).json({
        message: e.message,
      });
    }
  }
}
