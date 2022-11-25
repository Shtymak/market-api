import { GetAuthDto } from './dto/get-auth.dto';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { MagicLinkDto } from './dto/magic-link.dto';
import { SendCodeDto } from './dto/send-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with magic code' })
  @ApiBody({ type: MagicLinkDto })
  @ApiResponse({ status: HttpStatus.OK, type: GetAuthDto })
  @Post('login/code')
  async loginWithCode(@Body() body: MagicLinkDto, @Res() response: Response) {
    try {
      const token = await this.authService.magicLogin(body);
      response.status(HttpStatus.OK).json(token);
    } catch (e) {
      response.status(HttpStatus.BAD_REQUEST).json(e.message);
    }
  }

  @Post('send/code')
  async sendCode(@Body() body: SendCodeDto, @Res() response: Response) {
    try {
      const token = await this.authService.sendLoginMagicLink(body.email);
      response.status(HttpStatus.OK).json(token);
    } catch (e) {
      response.status(HttpStatus.BAD_REQUEST).json(e.message);
    }
  }
}
