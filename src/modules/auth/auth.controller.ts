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
import { AuthService } from '@/modules/auth/auth.service';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { LoginResponseDto } from '@/modules/auth/dto/login-response.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { securityConfig } from '@/shared/config/security.config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Get security config for decorators
const security = securityConfig();

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Throttle({
    auth: {
      limit: Math.floor(security.rateLimiting.auth.limit * 0.6), // 60% of auth limit for registration
      ttl: security.rateLimiting.auth.ttl,
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(registerDto, response);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({
    auth: {
      limit: security.rateLimiting.auth.limit,
      ttl: security.rateLimiting.auth.ttl,
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password, response);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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
