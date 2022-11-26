import { GetAuthDto } from './dto/get-auth.dto';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
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
}
