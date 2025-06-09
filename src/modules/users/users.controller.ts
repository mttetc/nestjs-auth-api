import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoggerService } from '@/modules/logger/logger.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { TokenBlacklistGuard } from '@/modules/auth/guards/token-blacklist.guard';
import { Throttle } from '@nestjs/throttler';
import { securityConfig } from '../../shared/config/security.config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

// Get security config for decorators
const security = securityConfig();

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new LoggerService(UsersController.name);

  // Public registration endpoint
  @Post()
  @ApiOperation({ summary: 'Create a new user (Public)' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  register(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponseDto],
  })
  @Throttle({
    long: {
      limit: Math.floor(security.rateLimiting.long.limit * 0.5), // 50% of long limit for listing users
      ttl: security.rateLimiting.long.ttl,
    },
  })
  @Get()
  findAll(@Ip() ip: string) {
    this.logger.log(`Finding all users from ${ip}`, `UsersController ${ip}`);
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Throttle({
    medium: {
      limit: security.rateLimiting.medium.limit,
      ttl: security.rateLimiting.medium.ttl,
    },
  })
  @Get(':id')
  findOneById(@Param('id') id: number, @Ip() ip: string) {
    this.logger.log(`Finding user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('email/:email')
  findOneByEmail(@Param('email') email: string, @Ip() ip: string) {
    this.logger.log(
      `Finding user ${email} from ${ip}`,
      `UsersController ${ip}`,
    );
    return this.usersService.findOneByEmail(email);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
    @Ip() ip: string,
  ) {
    this.logger.log(`Updating user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  remove(@Param('id') id: number, @Ip() ip: string) {
    this.logger.log(`Deleting user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.remove(id);
  }
}
