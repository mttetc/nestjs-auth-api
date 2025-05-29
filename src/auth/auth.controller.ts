import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'generated/prisma';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: Prisma.UserCreateInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(registerDto, response);
  }

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password, response);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.authService.logout(response, token);
  }
}
